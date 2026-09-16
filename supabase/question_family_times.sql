-- Per-question-family timing — how long each student takes on a whole
-- question family (e.g. all steps of Question 201: 201-1, 201-2, ... 201-n).
-- ============================================================
-- One row is written PER COMPLETED question family attempt:
--   * questionStartTime = when the student first enters the family
--     (NOT reset when moving between steps or revisiting a step)
--   * questionFinishTime = when the final step of the family is completed
--   * durationSeconds = finish - start
--
-- The client (browser) captures the timestamps with
-- new Date().toISOString() and calls the log_question_family_time RPC
-- once, when the family's final step is completed. The app never touches
-- this table directly with the anon key — same pattern as
-- session_times.sql / student_progress.sql (SECURITY DEFINER RPC guarded
-- by public.authorised_users).
--
-- HOW TO USE:
--   1. Supabase project -> SQL Editor -> New query.
--   2. Paste this ENTIRE file and click Run.
--   3. Confirm table:     public.question_family_times
--   4. Confirm functions: log_question_family_time, list_question_family_times
--
-- HOW THE TEAM READS / EXPORTS THE DATA (SQL Editor, postgres role):
--   select * from public.question_family_times_logged;   -- sorted by user, then time
-- Then use the "Download CSV" button in the SQL Editor results.
-- ============================================================

create table if not exists public.question_family_times (
  id                bigint generated always as identity primary key,
  -- Which student (their login email = studentId) and which browsing session.
  email             text not null,
  session_id        uuid not null,
  -- The question family, e.g. '201' (the part before the '-' in '201-3').
  question_family_id text not null,
  class_id          text not null default '',
  -- Timestamps captured client-side (ISO 8601 / timestamptz).
  login_time        timestamptz,
  question_start_time  timestamptz not null,
  question_finish_time timestamptz not null,
  -- finish - start, in whole seconds (validated/clamped server-side).
  duration_seconds  integer not null,
  created_at        timestamptz not null default now()
);

create index if not exists question_family_times_email_idx
  on public.question_family_times (email);

create index if not exists question_family_times_family_idx
  on public.question_family_times (question_family_id);

create index if not exists question_family_times_session_idx
  on public.question_family_times (session_id);

alter table public.question_family_times enable row level security;

-- No direct table access from the anon key; only the RPCs below.
revoke all on table public.question_family_times from anon, authenticated;
grant usage on schema public to anon, authenticated;

-- ------------------------------------------------------------
-- log_question_family_time: insert ONE completed-family record.
-- Called by the client when a family's final step is completed.
-- Only known accounts (same pool as login) may write.
--
-- duration_seconds is recomputed server-side from the two timestamps
-- when possible (defensive), falling back to the client value; it is
-- always clamped to >= 0.
-- ------------------------------------------------------------
create or replace function public.log_question_family_time(
  p_email text,
  p_session_id uuid,
  p_question_family_id text,
  p_question_start_time timestamptz,
  p_question_finish_time timestamptz,
  p_duration_seconds integer default null,
  p_login_time timestamptz default null,
  p_class_id text default ''
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email  text := lower(trim(coalesce(p_email, '')));
  v_family text := trim(coalesce(p_question_family_id, ''));
  v_computed integer;
  v_dur integer;
begin
  if v_email = ''
     or p_session_id is null
     or v_family = ''
     or p_question_start_time is null
     or p_question_finish_time is null then
    return false;
  end if;

  -- Only known accounts (same guard used by upsert_student_progress).
  if not exists (
    select 1 from public.authorised_users
    where lower(email) = v_email
  ) then
    return false;
  end if;

  -- Prefer the server-computed duration; fall back to the client's value.
  v_computed := floor(
    extract(epoch from (p_question_finish_time - p_question_start_time))
  )::integer;
  v_dur := greatest(coalesce(v_computed, p_duration_seconds, 0), 0);

  insert into public.question_family_times (
    email,
    session_id,
    question_family_id,
    class_id,
    login_time,
    question_start_time,
    question_finish_time,
    duration_seconds
  )
  values (
    v_email,
    p_session_id,
    v_family,
    coalesce(nullif(trim(p_class_id), ''), ''),
    p_login_time,
    p_question_start_time,
    p_question_finish_time,
    v_dur
  );

  return true;
end;
$$;

-- ------------------------------------------------------------
-- list_question_family_times: staff-facing read of all records,
-- sorted by user (email) then by when the family was started.
-- ------------------------------------------------------------
create or replace function public.list_question_family_times()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  return coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'studentId', q.email,
          'sessionId', q.session_id,
          'questionFamilyId', q.question_family_id,
          'classId', q.class_id,
          'loginTime', q.login_time,
          'questionStartTime', q.question_start_time,
          'questionFinishTime', q.question_finish_time,
          'durationSeconds', q.duration_seconds
        )
        order by q.email asc, q.question_start_time asc
      )
      from public.question_family_times q
    ),
    '[]'::jsonb
  );
end;
$$;

grant execute on function public.log_question_family_time(
  text, uuid, text, timestamptz, timestamptz, integer, timestamptz, text
) to anon, authenticated;
grant execute on function public.list_question_family_times() to anon, authenticated;

-- ============================================================
-- Reporting view: question_family_times_logged
-- ------------------------------------------------------------
-- One row per completed question family, sorted by user then by start
-- time, with human-friendly duration columns. Export to CSV from the
-- SQL Editor's "Download CSV" button.
-- ============================================================
create or replace view public.question_family_times_logged as
select
  q.email                as student_id,
  q.class_id,
  q.session_id,
  q.question_family_id,
  q.login_time,
  q.question_start_time,
  q.question_finish_time,
  q.duration_seconds,
  round(q.duration_seconds / 60.0, 2) as duration_minutes,
  to_char((q.duration_seconds || ' seconds')::interval, 'HH24:MI:SS') as duration_hms
from public.question_family_times q
order by q.email asc, q.question_start_time asc;

-- Anon/authenticated cannot read the view directly (staff use it in SQL Editor).
revoke all on public.question_family_times_logged from anon, authenticated;
