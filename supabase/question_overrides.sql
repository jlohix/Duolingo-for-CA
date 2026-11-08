-- ============================================================
-- Question overrides — admin-edited question content (shared)
-- ============================================================
-- Admins edit a question's wording, options, correct answer, or image in
-- the Staff editor. The edit is stored here and applied on top of the
-- static CSV question bank for EVERY user on EVERY device at load time.
--
-- Each override also captures the BEFORE snapshot (the values as they were
-- when the admin opened the editor) so the Dashboard of Shame can show the
-- manual edit as a before/after entry alongside the git-derived history.
--
-- HOW TO USE:
--   1. Supabase -> SQL Editor -> New query -> paste this ENTIRE file -> Run.
--   2. (Optional) For uploaded images, reuse the existing public Storage
--      bucket, or paste an image URL directly in the editor.
--   3. Verify: Database -> Tables shows `question_overrides`; Functions
--      shows upsert / list / delete_question_override.
--
-- Safe to re-run (idempotent). Same RLS-no-policy + SECURITY DEFINER pattern
-- as announcements.sql / question_reports.sql.
-- ============================================================

-- ---------- 1. Table ----------
create table if not exists public.question_overrides (
  question_id   text primary key,                 -- composite app id, e.g. 'opamp-202-2'
  bank_id       text,                             -- e.g. 'opamp'
  question      text,                             -- edited question text (null = keep CSV)
  option_a      text,
  option_b      text,
  option_c      text,
  option_d      text,
  answer        text,                             -- 'optionA'..'optionD' or 'a'..'d'
  image         text,                             -- image URL
  explanation   text,
  -- BEFORE snapshot, stored as JSON, captured at edit time for the Shame log.
  before_json   jsonb,
  edited_by     text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Lock the table: RLS on, no policies -> no direct anon access; RPCs only.
alter table public.question_overrides enable row level security;

create index if not exists question_overrides_bank_idx
  on public.question_overrides (bank_id);
create index if not exists question_overrides_updated_idx
  on public.question_overrides (updated_at desc);


-- ---------- 2. Upsert (admin) ----------
-- Insert or replace an override for one question. p_before_json is the
-- snapshot of the question as it looked before this edit (may be null).
create or replace function public.upsert_question_override(
  p_question_id text,
  p_bank_id     text,
  p_question    text,
  p_option_a    text,
  p_option_b    text,
  p_option_c    text,
  p_option_d    text,
  p_answer      text,
  p_image       text,
  p_explanation text,
  p_before_json jsonb,
  p_edited_by   text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.question_overrides as qo (
    question_id, bank_id, question, option_a, option_b, option_c, option_d,
    answer, image, explanation, before_json, edited_by, updated_at
  )
  values (
    p_question_id, p_bank_id, p_question, p_option_a, p_option_b, p_option_c,
    p_option_d, p_answer, p_image, p_explanation, p_before_json, p_edited_by, now()
  )
  on conflict (question_id) do update set
    bank_id     = excluded.bank_id,
    question    = excluded.question,
    option_a    = excluded.option_a,
    option_b    = excluded.option_b,
    option_c    = excluded.option_c,
    option_d    = excluded.option_d,
    answer      = excluded.answer,
    image       = excluded.image,
    explanation = excluded.explanation,
    -- keep the EARLIEST before snapshot so the Shame log shows the true original
    before_json = coalesce(qo.before_json, excluded.before_json),
    edited_by   = excluded.edited_by,
    updated_at  = now();
end;
$$;


-- ---------- 3. List (everyone) ----------
create or replace function public.list_question_overrides()
returns setof public.question_overrides
language sql
security definer
set search_path = public
as $$
  select * from public.question_overrides order by updated_at desc;
$$;


-- ---------- 4. Delete / revert (admin) ----------
create or replace function public.delete_question_override(p_question_id text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  hit boolean;
begin
  delete from public.question_overrides where question_id = p_question_id;
  get diagnostics hit = row_count;
  return hit > 0;
end;
$$;


-- ---------- 5. Grants ----------
grant execute on function public.upsert_question_override(
  text, text, text, text, text, text, text, text, text, text, jsonb, text
) to anon, authenticated;
grant execute on function public.list_question_overrides() to anon, authenticated;
grant execute on function public.delete_question_override(text) to anon, authenticated;
