// ============================================================
// RAG chatbot — the "chat" Edge Function (with conversation memory)
// ------------------------------------------------------------
// Client sends { question, history? } -> this function:
//   1. embeds the LATEST question with Gemini (768-dim, matches documents)
//   2. calls match_documents() to retrieve relevant lecture chunks
//   3. builds a grounded, multi-turn prompt (system + context + prior
//      conversation + latest question) and asks Gemini to answer
//   4. returns { answer, sources }
//
// `history` is an optional array of prior turns:
//   [{ role: "user" | "model", text: string }, ...]
// It is capped server-side (defensive) to the most recent turns. RAG is
// always run against the latest user question only.
//
// Secrets (set in Supabase -> Edge Functions -> chat -> Secrets):
//   GEMINI_API_KEY               (your Gemini key)
//   SUPABASE_URL                 (auto-provided by Supabase)
//   SUPABASE_SERVICE_ROLE_KEY    (auto-provided by Supabase)
//
// Deploy via the Supabase Dashboard: Edge Functions -> Deploy a new
// function -> name it "chat" -> paste this file -> Deploy.
// ============================================================

import { createClient } from "jsr:@supabase/supabase-js@2";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const EMBED_MODEL = "gemini-embedding-001";
const EMBED_DIM = 768;
const MATCH_COUNT = 5;

// Max number of prior turns (user + model messages) to keep as context.
// A "turn" here is a single message, so 8 turns ≈ 4 back-and-forth
// exchanges. The client already trims, this is a defensive server cap.
const MAX_HISTORY_TURNS = 8;

// CORS so the browser app can call this function.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

type Turn = { role: "user" | "model"; text: string };

// Sanitize the incoming history: keep only well-formed user/model turns,
// then keep just the most recent MAX_HISTORY_TURNS of them.
function sanitizeHistory(raw: unknown): Turn[] {
  if (!Array.isArray(raw)) return [];
  const cleaned: Turn[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const role = (item as any).role;
    const text = (item as any).text;
    if ((role === "user" || role === "model") && typeof text === "string" && text.trim()) {
      cleaned.push({ role, text: text.trim() });
    }
  }
  return cleaned.slice(-MAX_HISTORY_TURNS);
}

// Embed the question (768-dim to match the documents table).
async function embedQuestion(text: string): Promise<number[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:embedContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: `models/${EMBED_MODEL}`,
        content: { parts: [{ text }] },
        outputDimensionality: EMBED_DIM,
      }),
    },
  );
  if (!res.ok) throw new Error(`Embed failed: ${await res.text()}`);
  const data = await res.json();
  return data.embedding.values as number[];
}

// Find a chat model this API key can actually use (models change often).
async function pickChatModel(): Promise<string> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`,
    );
    if (res.ok) {
      const data = await res.json();
      const usable = (data.models || [])
        .filter((m: any) =>
          m.supportedGenerationMethods?.includes("generateContent")
        )
        .map((m: any) => m.name.replace("models/", ""))
        // Exclude deprecated 1.x/2.x flash models blocked for new users.
        .filter((n: string) => !/gemini-[12]\./.test(n));
      // Prefer a newer "flash" model (fast + cheap), else first usable.
      const flash = usable.find((n: string) => n.includes("flash"));
      if (flash) return flash;
      if (usable.length) return usable[0];
    }
  } catch (_) { /* fall through */ }
  return "gemini-3.6-flash"; // current recommended fallback
}

// Build a grounded, multi-turn answer.
//   question -> the latest student message
//   context  -> retrieved lecture chunks (RAG, based on `question`)
//   history  -> prior conversation turns (already sanitized + capped)
async function generateAnswer(
  question: string,
  context: string,
  history: Turn[],
): Promise<string> {
  const model = await pickChatModel();
  const systemPrompt =
    "You are a tutor for the university course EE2101 Circuit Analysis, " +
    "talking with a student.\n" +
    "Rules:\n" +
    "- Answer using ONLY the lecture context below and the earlier conversation.\n" +
    "- If the answer isn't there, say it's not in the course material and " +
    "suggest checking the lecture slides or asking their tutor.\n" +
    "- Be concise and direct. Get to the point; skip filler.\n" +
    "- Wrap all math in LaTeX: $...$ inline, $$...$$ for display equations.\n" +
    "- Do NOT use em dashes (—) or double hyphens (--); use commas or full stops.\n" +
    "- Keep formatting light: short paragraphs, and a simple '- ' bullet list " +
    "only when it genuinely helps. Avoid headings unless the answer is long.\n\n" +
    `Lecture context:\n${context}`;

  // Gemini's `contents` is an ordered list of turns. We seed it with the
  // system prompt + retrieved context as the first user turn (and a short
  // model acknowledgement), then replay the prior conversation, then append
  // the student's latest question.
  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [
    { role: "user", parts: [{ text: systemPrompt }] },
    { role: "model", parts: [{ text: "Understood. I'll help using the lecture material and our conversation so far." }] },
    ...history.map((t) => ({ role: t.role, parts: [{ text: t.text }] })),
    { role: "user", parts: [{ text: question }] },
  ];

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
  const requestInit = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents }),
  };

  // Retry on transient overload (503) / rate-limit (429) with backoff.
  let res: Response | null = null;
  let lastErr = "";
  for (let attempt = 0; attempt < 4; attempt++) {
    res = await fetch(url, requestInit);
    if (res.ok) break;
    if (res.status === 503 || res.status === 429) {
      lastErr = await res.text();
      await new Promise((r) => setTimeout(r, 800 * (attempt + 1))); // 0.8s, 1.6s, 2.4s
      continue;
    }
    throw new Error(`Generate failed: ${await res.text()}`);
  }
  if (!res || !res.ok) {
    throw new Error(
      "The tutor is busy right now (the AI model is overloaded). " +
        "Please try again in a moment." +
        (lastErr ? ` (${lastErr})` : ""),
    );
  }
  const data = await res.json();
  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "Sorry, I couldn't generate an answer."
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const body = await req.json();
    const question = body?.question;
    if (!question || typeof question !== "string" || !question.trim()) {
      return json({ error: "Please provide a question." }, 400);
    }
    const history = sanitizeHistory(body?.history);

    // 1. Embed the LATEST question (RAG is always about the newest message).
    const embedding = await embedQuestion(question.trim());

    // 2. Retrieve relevant lecture chunks.
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: docs, error } = await supabase.rpc("match_documents", {
      query_embedding: embedding,
      match_count: MATCH_COUNT,
    });
    if (error) throw new Error(`match_documents failed: ${error.message}`);

    if (!docs || docs.length === 0) {
      return json({
        answer:
          "I couldn't find anything about that in the EE2101 course material. " +
          "Try rephrasing, or check the lecture slides / ask your tutor.",
        sources: [],
      });
    }

    // 3. Build context + generate a grounded answer (with conversation memory).
    const context = docs
      .map((d: any) => d.content)
      .join("\n\n---\n\n");
    const answer = await generateAnswer(question.trim(), context, history);

    // 4. Return answer + which weeks it drew from.
    const sources = [
      ...new Set(docs.map((d: any) => d.metadata?.source).filter(Boolean)),
    ];
    return json({ answer, sources });
  } catch (err) {
    return json({ error: String(err?.message || err) }, 500);
  }
});
