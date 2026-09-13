// ============================================================
// RAG chatbot — Step 3: the "chat" Edge Function
// ------------------------------------------------------------
// Client sends { question } -> this function:
//   1. embeds the question with Gemini (768-dim, matches documents)
//   2. calls match_documents() to retrieve relevant lecture chunks
//   3. builds a grounded prompt and asks Gemini to answer
//   4. returns { answer, sources }
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
        .map((m: any) => m.name.replace("models/", ""));
      // Prefer a "flash" model (fast + cheap), else the first usable one.
      const flash = usable.find((n: string) => n.includes("flash"));
      if (flash) return flash;
      if (usable.length) return usable[0];
    }
  } catch (_) { /* fall through */ }
  return "gemini-2.5-flash"; // sensible fallback
}

async function generateAnswer(question: string, context: string): Promise<string> {
  const model = await pickChatModel();
  const systemPrompt =
    "You are a helpful tutor for the university course EE2101 Circuit Analysis. " +
    "Answer the student's question using ONLY the lecture context provided below. " +
    "If the answer is not in the context, say you don't have that in the course " +
    "material and suggest they check the lecture slides or ask their tutor. " +
    "Use clear explanations and LaTeX ($...$) for any math.\n\n" +
    `Lecture context:\n${context}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: `${systemPrompt}\n\nStudent question: ${question}` }] },
        ],
      }),
    },
  );
  if (!res.ok) throw new Error(`Generate failed: ${await res.text()}`);
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
    const { question } = await req.json();
    if (!question || typeof question !== "string" || !question.trim()) {
      return json({ error: "Please provide a question." }, 400);
    }

    // 1. Embed the question.
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

    // 3. Build context + generate a grounded answer.
    const context = docs
      .map((d: any) => d.content)
      .join("\n\n---\n\n");
    const answer = await generateAnswer(question.trim(), context);

    // 4. Return answer + which weeks it drew from.
    const sources = [
      ...new Set(docs.map((d: any) => d.metadata?.source).filter(Boolean)),
    ];
    return json({ answer, sources });
  } catch (err) {
    return json({ error: String(err?.message || err) }, 500);
  }
});
