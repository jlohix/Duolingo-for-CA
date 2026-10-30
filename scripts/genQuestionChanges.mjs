#!/usr/bin/env node
/**
 * Dashboard of Shame — question change-history generator.
 *
 * Walks the git history of public/question-bank/csv/*.csv, parses every
 * revision of each CSV, and records a change entry whenever a question's
 * text, any option, the correct answer, or the image URL differs from the
 * previous revision. The output is a static data module the app imports at
 * build time (no backend, no runtime git access).
 *
 * Run: node scripts/genQuestionChanges.mjs
 * (wired as `npm run gen:changes`)
 */
import { execFileSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Papa from "papaparse";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const CSV_DIR = "public/question-bank/csv";
const OUT_FILE = resolve(REPO_ROOT, "src/data/questionChanges.generated.js");

// Map a csv filename -> { bankId, bankTitle, assetFolder } using questionBanks.
// We read it loosely via regex so this script stays dependency-light.
import { readFileSync } from "node:fs";
function loadBankMap() {
  const src = readFileSync(
    resolve(REPO_ROOT, "src/data/questionBanks.js"),
    "utf8"
  );
  const map = new Map();
  // Each bank object spans id/title/csv/assetFolder lines.
  const objRe =
    /id:\s*"([^"]+)"[\s\S]*?title:\s*"([^"]+)"[\s\S]*?csv:\s*"([^"]+)"[\s\S]*?assetFolder:\s*"([^"]+)"/g;
  let m;
  while ((m = objRe.exec(src))) {
    const [, id, title, csv, assetFolder] = m;
    map.set(csv.toLowerCase(), { bankId: id, bankTitle: title, assetFolder });
  }
  return map;
}

function git(args) {
  return execFileSync("git", ["--no-pager", ...args], {
    cwd: REPO_ROOT,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, GIT_PAGER: "cat", GIT_TERMINAL_PROMPT: "0" },
  });
}

// Commits (oldest -> newest) that touched the CSV folder.
function csvCommits() {
  const out = git([
    "log",
    "--reverse",
    "--format=%H\t%ct\t%s",
    "--",
    CSV_DIR,
  ]).trim();
  if (!out) return [];
  return out.split("\n").map((line) => {
    const [hash, ts, ...subj] = line.split("\t");
    return { hash, date: new Date(Number(ts) * 1000), subject: subj.join("\t") };
  });
}

// List csv files present in CSV_DIR at a given commit.
function csvFilesAt(hash) {
  const out = git(["ls-tree", "--name-only", `${hash}:${CSV_DIR}`]).trim();
  if (!out) return [];
  return out.split("\n").filter((f) => f.toLowerCase().endsWith(".csv"));
}

// Read a file's contents at a commit, or null if it does not exist there.
function fileAt(hash, file) {
  try {
    return git(["show", `${hash}:${CSV_DIR}/${file}`]);
  } catch {
    return null;
  }
}

const clean = (v) => String(v ?? "").trim();

// Parse a CSV string into a map of questionId -> normalized record.
function parseQuestions(text) {
  if (!text) return new Map();
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  const map = new Map();
  for (const row of parsed.data) {
    const id = clean(row.id);
    if (!id) continue;
    map.set(id, {
      id,
      question: clean(row.question),
      optionA: clean(row.optionA),
      optionB: clean(row.optionB),
      optionC: clean(row.optionC),
      optionD: clean(row.optionD),
      answer: clean(row.answer),
      image: clean(row.image),
    });
  }
  return map;
}

const OPTION_KEYS = ["optionA", "optionB", "optionC", "optionD"];

// Compare two question records; return an array of field-level changes.
function diffQuestion(prev, next) {
  const changes = [];
  if (prev.question !== next.question) {
    changes.push({
      field: "question",
      label: "Question text",
      before: prev.question,
      after: next.question,
    });
  }
  for (const key of OPTION_KEYS) {
    if (prev[key] !== next[key]) {
      changes.push({
        field: key,
        label: `Option ${key.slice(-1)}`,
        before: prev[key],
        after: next[key],
      });
    }
  }
  if (prev.answer !== next.answer) {
    changes.push({
      field: "answer",
      label: "Correct answer",
      before: prev.answer,
      after: next.answer,
    });
  }
  if (prev.image !== next.image) {
    changes.push({
      field: "image",
      label: "Question image",
      before: prev.image,
      after: next.image,
    });
  }
  return changes;
}

function main() {
  const bankMap = loadBankMap();
  const commits = csvCommits();
  if (commits.length < 2) {
    console.error("Not enough CSV history to diff.");
  }

  // Per-file snapshot of the previous parsed state as we walk forward.
  const prevByFile = new Map();
  const entries = [];

  for (const commit of commits) {
    const files = csvFilesAt(commit.hash);
    for (const file of files) {
      const text = fileAt(commit.hash, file);
      const curr = parseQuestions(text);
      const prev = prevByFile.get(file);
      if (prev) {
        for (const [id, nextRec] of curr) {
          const prevRec = prev.get(id);
          if (!prevRec) continue; // newly added question — not a "change"
          const changes = diffQuestion(prevRec, nextRec);
          if (changes.length) {
            const bank = bankMap.get(file.toLowerCase()) || {
              bankId: file.replace(/\.csv$/i, ""),
              bankTitle: file.replace(/\.csv$/i, ""),
              assetFolder: "",
            };
            entries.push({
              id: `${commit.hash.slice(0, 8)}-${file}-${id}`,
              commit: commit.hash.slice(0, 8),
              date: commit.date.toISOString().slice(0, 10),
              bankId: bank.bankId,
              bankTitle: bank.bankTitle,
              questionId: id,
              question: nextRec.question,
              changes,
            });
          }
        }
      }
      prevByFile.set(file, curr);
    }
  }

  // Newest first for display.
  entries.reverse();

  const header =
    "// AUTO-GENERATED by scripts/genQuestionChanges.mjs — do not edit by hand.\n" +
    "// Regenerate with `npm run gen:changes`.\n" +
    `// Generated ${new Date().toISOString()} from ${commits.length} CSV commits.\n`;
  const body = `export const QUESTION_CHANGES = ${JSON.stringify(
    entries,
    null,
    2
  )};\n`;

  mkdirSync(dirname(OUT_FILE), { recursive: true });
  writeFileSync(OUT_FILE, header + body, "utf8");
  console.log(
    `Wrote ${entries.length} change entries to ${OUT_FILE} (from ${commits.length} commits).`
  );
}

main();
