-- ============================================================
-- Question Reports — table + functions
-- ============================================================
-- Stores student-submitted reports about quiz questions so that
-- admins can review and fix them.
--
-- HOW TO USE:
--   1. Open your Supabase project -> SQL Editor -> New query.
--   2. Paste this ENTIRE file.
--   3. Click "Run".
--   4. Verify: Database -> Tables shows `question_reports`, and
--      Database -> Functions shows submit_question_report,
--      list_question_reports, and resolve_question_report.
--
-- This follows the same pattern as the other RPCs in this project:
-- called from the browser via the anon key, using SECURITY DEFINER
-- functions so the table itself stays locked down by RLS.
-- ============================================================

-- ---------- 1. The table ----------
create table if not exists public.question_reports (
  id           uuid primary key default gen_random_uuid(),
  question_id  text        not null,
  question_text text,
  reason       text        not null,
  note         text,
  reporter     text,                              -- student email (or 'anonymous')
  resolved     boolean     not null default false,
  created_at   timestamptz not null default now()
);

-- Enable Row Level Security. With no direct policies, the table is
-- locked from direct anon access; all reads/writes go through the
-- SECURITY DEFINER functions below (same approach as the app's other RPCs).
alter table public.question_reports enable row level security;

-- Helpful index for the admin list (newest first).
create index if not exists question_reports_created_at_idx
  on public.question_reports (created_at desc);


-- ---------- 2. Submit a report (called by students) ----------
create or replace function public.submit_question_report(
  p_question_id   text,
  p_question_text text,
  p_reason        text,
  p_note          text,
  p_reporter      text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Basic validation: a question id and a reason are required.
  if coalesce(trim(p_question_id), '') = ''
     or coalesce(trim(p_reason), '') = '' then
    return false;
  end if;

  insert into public.question_reports
    (question_id, question_text, reason, note, reporter)
  values
    (trim(p_question_id),
     left(coalesce(p_question_text, ''), 500),
     trim(p_reason),
     left(coalesce(p_note, ''), 400),
     lower(nullif(trim(coalesce(p_reporter, '')), '')));

  return true;
end;
$$;


-- ---------- 3. List all reports (called by admins) ----------
-- NOTE: admin-only viewing is enforced at the APP level — only the
-- admin screen ever calls this function. For a small class project
-- that is an acceptable trade-off.
create or replace function public.list_question_reports()
returns setof public.question_reports
language sql
security definer
set search_path = public
as $$
  select *
  from public.question_reports
  order by created_at desc;
$$;


-- ---------- 4. Mark a report resolved / unresolved (admins) ----------
create or replace function public.resolve_question_report(
  p_id       uuid,
  p_resolved boolean
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.question_reports
  set resolved = coalesce(p_resolved, true)
  where id = p_id;
  return found;
end;
$$;


-- ---------- 5. Allow the anon/authenticated roles to call the functions ----------
grant execute on function public.submit_question_report(text, text, text, text, text) to anon, authenticated;
grant execute on function public.list_question_reports() to anon, authenticated;
grant execute on function public.resolve_question_report(uuid, boolean) to anon, authenticated;
