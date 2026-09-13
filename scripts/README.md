# RAG ingestion (Step 2)

One-time, local script that loads your lecture slides into the Supabase
`documents` table so the chatbot can use them.

## Prerequisites
- Step 1 SQL (`supabase/rag_documents.sql`) has been run in Supabase.
- Node.js installed.

## Setup

1. **Install the script's dependencies** (from the project root):
   ```
   npm install pdf-parse @supabase/supabase-js dotenv
   ```

2. **Put your lecture PDFs** in `scripts/lectures/` and name them clearly
   so the source is meaningful, e.g.:
   ```
   scripts/lectures/week01.pdf
   scripts/lectures/week02.pdf
   ...
   scripts/lectures/week13.pdf
   ```
   (This folder is gitignored — your PDFs are not committed.)

3. **Add the ingestion keys to your local `.env`** (project root). In
   addition to the existing VITE_ vars, add:
   ```
   SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   GEMINI_API_KEY=your-gemini-key
   ```
   The service_role key is from Supabase → Settings → API. It is SECRET —
   it only lives in your local `.env` (gitignored) and is only used by
   this local script, never in the app.

## Run
```
node scripts/ingest.js
```
It processes each PDF, chunks + embeds the text (Gemini, 768-dim), and
inserts rows into `documents`. It rate-limits itself for the free tier
and is **resumable**: finished PDFs are recorded in
`scripts/.ingest-progress.json`, so re-running skips them.

## After it runs
Spot-check in Supabase → Table Editor → `documents` (you should see rows
with `content` + `metadata.source`). Then move on to Step 3 (the chat
Edge Function).

## Notes / limitations
- PDF text extraction handles worded/bullet content well, but **equations
  often garble and diagrams (images) extract as nothing**. If answers are
  thin on math-heavy topics, supplement `scripts/lectures/` with typed
  notes (as .pdf or adapt the script for .txt) and re-run.
- To re-ingest a single week after editing it: delete that file's rows
  from `documents`, remove its name from `.ingest-progress.json`, re-run.
