/* ============================================================
 * RAG ingestion — Step 2
 * ------------------------------------------------------------
 * Reads every PDF in scripts/lectures/, extracts text, splits it
 * into chunks, embeds each chunk with Gemini (768-dim), and inserts
 * them into the Supabase `documents` table.
 *
 * ONE-TIME, LOCAL script. Run with:  node scripts/ingest.js
 *
 * Requires a local .env (in the project root) with:
 *   GEMINI_API_KEY=...            (from aistudio.google.com)
 *   SUPABASE_URL=https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=... (Supabase → Settings → API → service_role)
 *
 * NEVER commit .env or the service_role key.
 *
 * Resumable: it records which PDFs are already done in
 * scripts/.ingest-progress.json, so re-running skips finished files.
 * ============================================================ */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

// pdf-parse is a CommonJS package; load it via require so it works in ESM.
// Different versions export the parser differently, so normalise it.
const require = createRequire(import.meta.url);
const pdfModule = require("pdf-parse");
const pdf =
  typeof pdfModule === "function"
    ? pdfModule
    : typeof pdfModule?.default === "function"
      ? pdfModule.default
      : typeof pdfModule?.pdf === "function"
        ? pdfModule.pdf
        : null;
if (!pdf) {
  throw new Error(
    "Could not load pdf-parse as a function. Installed shape: " +
      JSON.stringify(Object.keys(pdfModule || {}))
  );
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---- config (tune these if needed) ----
const LECTURES_DIR = path.join(__dirname, "lectures");
const PROGRESS_FILE = path.join(__dirname, ".ingest-progress.json");
const EMBED_MODEL = "gemini-embedding-001"; // 768-dim (matches rag_documents.sql)
const EMBED_DIM = 768;
const CHUNK_WORDS = 400; // words per chunk
const CHUNK_OVERLAP = 60; // words repeated between consecutive chunks
const BATCH_SIZE = 5; // chunks embedded before a pause
const PAUSE_MS = 1500; // pause between batches (free-tier rate limiting)

// ---- env ----
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Missing env. Create a .env in the project root with GEMINI_API_KEY, " +
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- text helpers ----
function cleanText(text) {
  return String(text || "")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function chunkText(text) {
  const words = cleanText(text).split(/\s+/).filter(Boolean);
  const chunks = [];
  let i = 0;
  while (i < words.length) {
    const slice = words.slice(i, i + CHUNK_WORDS).join(" ").trim();
    if (slice.length > 40) chunks.push(slice); // skip tiny/empty chunks
    if (i + CHUNK_WORDS >= words.length) break;
    i += CHUNK_WORDS - CHUNK_OVERLAP;
  }
  return chunks;
}

// ---- Gemini embedding ----
async function embed(text) {
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `${EMBED_MODEL}:embedContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: `models/${EMBED_MODEL}`,
      content: { parts: [{ text }] },
      outputDimensionality: EMBED_DIM,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Embed failed (${res.status}): ${detail}`);
  }
  const data = await res.json();
  const values = data?.embedding?.values;
  if (!Array.isArray(values) || values.length !== EMBED_DIM) {
    throw new Error(
      `Unexpected embedding shape (got ${values?.length}, want ${EMBED_DIM})`
    );
  }
  return values;
}

// ---- progress tracking (resumable) ----
function loadProgress() {
  try {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf8"));
  } catch {
    return { done: [] };
  }
}
function saveProgress(p) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(p, null, 2));
}

// ---- main ----
async function main() {
  if (!fs.existsSync(LECTURES_DIR)) {
    console.error(`Put your PDFs in: ${LECTURES_DIR}`);
    process.exit(1);
  }
  const pdfs = fs
    .readdirSync(LECTURES_DIR)
    .filter((f) => f.toLowerCase().endsWith(".pdf"))
    .sort();

  if (pdfs.length === 0) {
    console.error(`No PDFs found in ${LECTURES_DIR}`);
    process.exit(1);
  }

  const progress = loadProgress();
  console.log(`Found ${pdfs.length} PDF(s). Already done: ${progress.done.length}.`);

  for (const file of pdfs) {
    if (progress.done.includes(file)) {
      console.log(`- skip ${file} (already ingested)`);
      continue;
    }
    console.log(`\n=== ${file} ===`);
    const buf = fs.readFileSync(path.join(LECTURES_DIR, file));
    const parsed = await pdf(buf);
    const chunks = chunkText(parsed.text);
    console.log(`  extracted ${parsed.numpages} pages -> ${chunks.length} chunks`);

    let inserted = 0;
    for (let b = 0; b < chunks.length; b += BATCH_SIZE) {
      const batch = chunks.slice(b, b + BATCH_SIZE);
      const rows = [];
      for (const content of batch) {
        try {
          const embedding = await embed(content);
          rows.push({
            content,
            metadata: { source: file },
            embedding,
          });
        } catch (err) {
          console.warn(`  ! embed error, skipping a chunk: ${err.message}`);
        }
      }
      if (rows.length) {
        const { error } = await supabase.from("documents").insert(rows);
        if (error) {
          console.error(`  ! insert error: ${error.message}`);
        } else {
          inserted += rows.length;
        }
      }
      process.stdout.write(`  ...${Math.min(b + BATCH_SIZE, chunks.length)}/${chunks.length}\r`);
      await sleep(PAUSE_MS); // rate-limit pause
    }

    console.log(`\n  inserted ${inserted} chunks from ${file}`);
    progress.done.push(file);
    saveProgress(progress);
  }

  console.log("\nDone. All PDFs ingested.");
}

main().catch((err) => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});
