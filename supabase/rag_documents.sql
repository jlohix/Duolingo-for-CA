-- ============================================================
-- RAG chatbot — Step 1: pgvector + documents table + search function
-- ============================================================
-- Stores chunks of your lecture materials as embeddings so the chatbot
-- can retrieve the most relevant pieces to answer a student's question.
--
-- RUN this in the Supabase SQL Editor (paste the whole file, click Run).
-- Re-running is safe.
--
-- Embedding size: 768 dimensions (Gemini gemini-embedding output size).
-- IMPORTANT: the ingestion script (Step 2) and the chat Edge Function
-- (Step 3) MUST request embeddings with this SAME dimension (768), or
-- the vectors will not be comparable.
-- ============================================================

-- 1. Enable the pgvector extension (safe if already enabled).
create extension if not exists vector;

-- 2. The documents table: one row per chunk of lecture material.
create table if not exists public.documents (
  id         bigint generated always as identity primary key,
  content    text not null,                 -- the chunk of lecture text
  metadata   jsonb not null default '{}',    -- e.g. {"source":"lecture3.pdf","page":5}
  embedding  vector(768),                    -- the chunk's embedding (768-dim)
  created_at timestamptz not null default now()
);

-- 3. Similarity search index (cosine distance). HNSW is fast for reads.
create index if not exists documents_embedding_idx
  on public.documents
  using hnsw (embedding vector_cosine_ops);

-- 4. RLS: lock the table down. Reads happen through the SECURITY DEFINER
--    function below (called by the Edge Function), not directly.
alter table public.documents enable row level security;
revoke all on table public.documents from anon, authenticated;

-- 5. match_documents(): return the most similar chunks to a query embedding.
--    Called server-side (by the chat Edge Function).
create or replace function public.match_documents(
  query_embedding vector(768),
  match_count int default 5
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language sql
stable
security definer
set search_path = public
as $$
  select
    d.id,
    d.content,
    d.metadata,
    1 - (d.embedding <=> query_embedding) as similarity  -- cosine similarity
  from public.documents d
  where d.embedding is not null
  order by d.embedding <=> query_embedding                -- nearest first
  limit greatest(1, least(match_count, 20));
$$;

-- The chat Edge Function uses the service_role key, which bypasses RLS,
-- so no extra grants are needed for it. We intentionally do NOT grant
-- match_documents to anon (students never call it directly).
