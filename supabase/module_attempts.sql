-- ============================================================
-- Module attempt tracking — repeats & completions per question bank
-- ============================================================
-- Analytics for two questions the team wants to answer:
--
--   Feature 1 — Module repeat count
--     How many times students REPEAT the same module. Every time a
--     student starts a module again after a previous attempt (whether
--     that previous attempt was completed or abandoned) counts as a
--     repeat. Two levels of detail:
--       * per-module total repeats (compare modules to each other)
--       * per-student breakdown within a module (who is struggling vs
--         who is just revisiting) — a COUNT, not just a yes/no flag.
--
--   Feature 2 — Module completion count
--     How many distinct people COMPLETE each module, where "complete"
--     means they answered every question in the module at least once
--     (right or wrong). Reported per module.
--
-- A "module" here is a QUESTION BANK (src/data/questionBanks.js): e.g.
-- ohms-law, kcl-kvl, power, supernode, ... Each attempt also records
-- the difficulty (1-3), so every report is available BOTH aggregated
-- across difficulties AND split per module+difficulty.
--
-- One row = one attempt. The app inserts a row when a bank module is
-- (re)started, and stamps completed_at when the run finishes (all
-- questions answered at least once). Abandoned attempts keep
-- completed_at = null but still count as attempts/repeats.
--
-- The app never touches this table directly with the anon key; it only
-- calls the SECURITY DEFINER RPCs below (same pattern as
-- student_progress.sql / session_times.sql / student_consent.sql).
--
-- HOW TO USE:
--   1. Supabase project -> SQL Editor -> New query.
--   2. Paste this ENTIRE file and click Run.
--   3. Confirm table:     public.module_attempts
--   4. Confirm functions: log_module_attempt_start,
--                         complete_module_attempt, list_module_attempts
--
-- HOW THE TEAM READS / EXPORTS THE DATA (SQL Editor, postgres role):
--   -- Feature 1: repeats aggregated across difficulties
--   select * from public.module_repeats_by_module;
--   -- Feature 1: repeats split per module + difficulty
--   select * from public.module_repeats_by_module_difficulty;
--   -- Feature 1: per-student attempt counts within each module
--   select * from public.module_attempts_by_student;
--   -- Feature 2: completion counts per module
--   select * from public.module_completions_by_module;
--   -- Feature 2: completion counts per module + difficulty
--   select * from public.module_completions_by_module_difficulty;
-- Use the "Download CSV" button in the SQL Editor results to export any.
--
-- TIMEZONE: timestamps are STORED in UTC (timestamptz + now()). The
-- raw-row views expose GMT+8 (Asia/Singapore) wall-clock columns for
-- convenience; the aggregate views are counts and are timezone-agnostic.
-- ============================================================

create table if not exists public.module_attempts (
  -- Client-generated UUID for this attempt (stable across start/complete).
  attempt_id     uuid primary key,
  email          text not null,
  -- Question bank id from src/data/questionBanks.js (e.g. 'supernode').
  module_id      text not null,
  -- 1 = Easy, 2 = Average, 3 = Challenging.
  difficulty     integer not null default 1,
  class_id       text not null default '',
  -- When this attempt was (re)started.
  started_at     timestamptz not null default now(),
  -- Set when the run finished (all questions answered >= once). NULL means
  -- the attempt was abandoned partway. Either way the row counts as an attempt.
  completed_at   timestamptz,
  -- Totals to back the "answered every question at least once" definition and
  -- to allow future drill-down. answered_count is the distinct questions the
  -- student answered at least once during this attempt.
  question_count integer not null default 0,
  answered_count integer not null default 0,
  user_agent     text not null default '',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists module_attempts_module_idx
  on public.module_attempts (module_id);

create index if not exists module_attempts_email_idx
  on public.module_attempts (email);

create index if not exists module_attempts_module_email_idx
  on public.module_attempts (module_id, email);

create index if not exists module_attempts_started_at_idx
  on public.module_attempts (started_at desc);

alter table public.module_attempts enable row level security;

-- No direct table access from the anon key; only the RPCs below.
revoke all on table public.module_attempts from anon, authenticated;
grant usage on schema public to anon, authenticated;

-- ------------------------------------------------------------
-- log_module_attempt_start: record that a module attempt has begun.
-- Called every time a bank module enters its quiz stage — so a fresh
-- row (a new attempt) is created on every (re)start. Idempotent per
-- attempt_id in case the client retries.
-- Only known accounts (same pool as login) may write.
-- ------------------------------------------------------------
create or replace function public.log_module_attempt_start(
  p_attempt_id uuid,
  p_email text,
  p_module_id text,
  p_difficulty integer default 1,
  p_class_id text default '',
  p_question_count integer default 0,
  p_user_agent text default ''
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_module text := trim(coalesce(p_module_id, ''));
  v_diff integer := coalesce(p_difficulty, 1);
begin
  if p_attempt_id is null or v_email = '' or v_module = '' then
    return false;
  end if;

  -- Clamp difficulty to the valid 1-3 range.
  if v_diff < 1 then v_diff := 1; end if;
  if v_diff > 3 then v_diff := 3; end if;

  -- Only known accounts (same guard used by upsert_student_progress).
  if not exists (
    select 1 from public.authorised_users
    where lower(email) = v_email
  ) then
    return false;
  end if;

  insert into public.module_attempts as ma (
    attempt_id,
    email,
    module_id,
    difficulty,
    class_id,
    started_at,
    question_count,
    user_agent
  )
  values (
    p_attempt_id,
    v_email,
    v_module,
    v_diff,
    coalesce(nullif(trim(p_class_id), ''), ''),
    now(),
    greatest(coalesce(p_question_count, 0), 0),
    left(coalesce(p_user_agent, ''), 400)
  )
  on conflict (attempt_id) do update set
    -- Keep the largest question_count we have seen; never null out data.
    question_count = greatest(ma.question_count, excluded.question_count),
    class_id = case
      when excluded.class_id <> '' then excluded.class_id else ma.class_id end,
    user_agent = case
      when excluded.user_agent <> '' then excluded.user_agent else ma.user_agent end,
    updated_at = now();

  return true;
end;
$$;

-- ------------------------------------------------------------
-- complete_module_attempt: stamp an attempt as completed.
-- Called when a run finishes (every question answered at least once).
-- Safe to call even if the start row is missing (upserts a completed row).
-- Only known accounts may write.
-- ------------------------------------------------------------
create or replace function public.complete_module_attempt(
  p_attempt_id uuid,
  p_email text,
  p_module_id text,
  p_difficulty integer default 1,
  p_class_id text default '',
  p_question_count integer default 0,
  p_answered_count integer default 0,
  p_user_agent text default ''
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_module text := trim(coalesce(p_module_id, ''));
  v_diff integer := coalesce(p_difficulty, 1);
begin
  if p_attempt_id is null or v_email = '' or v_module = '' then
    return false;
  end if;

  if v_diff < 1 then v_diff := 1; end if;
  if v_diff > 3 then v_diff := 3; end if;

  if not exists (
    select 1 from public.authorised_users
    where lower(email) = v_email
  ) then
    return false;
  end if;

  insert into public.module_attempts as ma (
    attempt_id,
    email,
    module_id,
    difficulty,
    class_id,
    started_at,
    completed_at,
    question_count,
    answered_count,
    user_agent
  )
  values (
    p_attempt_id,
    v_email,
    v_module,
    v_diff,
    coalesce(nullif(trim(p_class_id), ''), ''),
    now(),
    now(),
    greatest(coalesce(p_question_count, 0), 0),
    greatest(coalesce(p_answered_count, 0), 0),
    left(coalesce(p_user_agent, ''), 400)
  )
  on conflict (attempt_id) do update set
    -- Keep the first completion time; don't overwrite an earlier stamp.
    completed_at = coalesce(ma.completed_at, excluded.completed_at),
    question_count = greatest(ma.question_count, excluded.question_count),
    answered_count = greatest(ma.answered_count, excluded.answered_count),
    class_id = case
      when excluded.class_id <> '' then excluded.class_id else ma.class_id end,
    user_agent = case
      when excluded.user_agent <> '' then excluded.user_agent else ma.user_agent end,
    updated_at = now();

  return true;
end;
$$;

-- ------------------------------------------------------------
-- list_module_attempts: staff-facing read of every attempt row,
-- sorted by module, then user, then start time. Backs the app's
-- CSV export (src/state/moduleAttemptsExport.js).
-- ------------------------------------------------------------
create or replace function public.list_module_attempts()
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
          'attemptId', ma.attempt_id,
          'email', ma.email,
          'moduleId', ma.module_id,
          'difficulty', ma.difficulty,
          'classId', ma.class_id,
          'startedAt', ma.started_at,
          'completedAt', ma.completed_at,
          'completed', (ma.completed_at is not null),
          'questionCount', ma.question_count,
          'answeredCount', ma.answered_count
        )
        order by ma.module_id asc, ma.email asc, ma.started_at asc
      )
      from public.module_attempts ma
    ),
    '[]'::jsonb
  );
end;
$$;

grant execute on function public.log_module_attempt_start(uuid, text, text, integer, text, integer, text) to anon, authenticated;
grant execute on function public.complete_module_attempt(uuid, text, text, integer, text, integer, integer, text) to anon, authenticated;
grant execute on function public.list_module_attempts() to anon, authenticated;

-- ============================================================
-- Raw rows view (GMT+8 convenience columns)
-- ------------------------------------------------------------
-- One row per attempt with the timestamps also shown in Singapore
-- local time. Staff read this in the SQL Editor; anon cannot.
-- ============================================================
create or replace view public.module_attempts_raw as
select
  ma.attempt_id,
  ma.email,
  ma.module_id,
  ma.difficulty,
  ma.class_id,
  ma.started_at,
  ma.completed_at,
  (ma.completed_at is not null)                        as completed,
  (ma.started_at   at time zone 'Asia/Singapore')      as started_at_sgt,
  (ma.completed_at at time zone 'Asia/Singapore')      as completed_at_sgt,
  ma.question_count,
  ma.answered_count
from public.module_attempts ma
order by ma.module_id asc, ma.email asc, ma.started_at asc;

revoke all on public.module_attempts_raw from anon, authenticated;

-- ============================================================
-- FEATURE 1 — Module repeat count
-- ============================================================
-- A "repeat" is any attempt after a student's FIRST attempt at that
-- module. So for a given (module, student):
--     repeats = attempts - 1        (0 if they only tried it once)
-- and per module:
--     total repeats = total attempts - number of distinct students
--                     who attempted it.
-- Both the total-attempts count and the repeat count are exposed, so you
-- can see the COUNT of tries, not merely whether a repeat ever happened.
-- ------------------------------------------------------------

-- Per-student breakdown within each module (aggregated across difficulty):
-- how many times each individual student attempted the module, and how
-- many of those were repeats.
create or replace view public.module_attempts_by_student as
select
  ma.module_id,
  ma.email,
  count(*)                                    as attempts,
  greatest(count(*) - 1, 0)                   as repeats,
  count(*) filter (where ma.completed_at is not null) as completed_attempts,
  min(ma.started_at)                          as first_attempt_at,
  max(ma.started_at)                          as last_attempt_at
from public.module_attempts ma
group by ma.module_id, ma.email
order by ma.module_id asc, attempts desc, ma.email asc;

revoke all on public.module_attempts_by_student from anon, authenticated;

-- Per-student breakdown split per module + difficulty.
create or replace view public.module_attempts_by_student_difficulty as
select
  ma.module_id,
  ma.difficulty,
  ma.email,
  count(*)                                    as attempts,
  greatest(count(*) - 1, 0)                   as repeats,
  count(*) filter (where ma.completed_at is not null) as completed_attempts,
  min(ma.started_at)                          as first_attempt_at,
  max(ma.started_at)                          as last_attempt_at
from public.module_attempts ma
group by ma.module_id, ma.difficulty, ma.email
order by ma.module_id asc, ma.difficulty asc, attempts desc, ma.email asc;

revoke all on public.module_attempts_by_student_difficulty from anon, authenticated;

-- Per-module totals (aggregated across all 3 difficulties): compare which
-- modules get repeated the most across all modules.
create or replace view public.module_repeats_by_module as
select
  ma.module_id,
  count(*)                                    as total_attempts,
  count(distinct ma.email)                    as distinct_students,
  greatest(count(*) - count(distinct ma.email), 0) as repeat_attempts,
  round(count(*)::numeric / nullif(count(distinct ma.email), 0), 2)
                                              as avg_attempts_per_student
from public.module_attempts ma
group by ma.module_id
order by repeat_attempts desc, ma.module_id asc;

revoke all on public.module_repeats_by_module from anon, authenticated;

-- Per-module totals split per module + difficulty.
create or replace view public.module_repeats_by_module_difficulty as
select
  ma.module_id,
  ma.difficulty,
  count(*)                                    as total_attempts,
  count(distinct ma.email)                    as distinct_students,
  greatest(count(*) - count(distinct ma.email), 0) as repeat_attempts,
  round(count(*)::numeric / nullif(count(distinct ma.email), 0), 2)
                                              as avg_attempts_per_student
from public.module_attempts ma
group by ma.module_id, ma.difficulty
order by ma.module_id asc, ma.difficulty asc;

revoke all on public.module_repeats_by_module_difficulty from anon, authenticated;

-- ============================================================
-- FEATURE 2 — Module completion count
-- ============================================================
-- How many DISTINCT people completed each module (answered every
-- question at least once). An attempt counts as a completion when
-- completed_at is not null. We count distinct students so multiple
-- completed attempts by the same person count once.
-- ------------------------------------------------------------

-- Per-module (aggregated across all 3 difficulties): a student is counted
-- as completing the module if they completed it at ANY difficulty.
create or replace view public.module_completions_by_module as
select
  ma.module_id,
  count(distinct ma.email) filter (where ma.completed_at is not null)
                                              as students_completed,
  count(*) filter (where ma.completed_at is not null)
                                              as completed_attempts,
  count(distinct ma.email)                    as students_attempted
from public.module_attempts ma
group by ma.module_id
order by students_completed desc, ma.module_id asc;

revoke all on public.module_completions_by_module from anon, authenticated;

-- Per-module completion split per module + difficulty.
create or replace view public.module_completions_by_module_difficulty as
select
  ma.module_id,
  ma.difficulty,
  count(distinct ma.email) filter (where ma.completed_at is not null)
                                              as students_completed,
  count(*) filter (where ma.completed_at is not null)
                                              as completed_attempts,
  count(distinct ma.email)                    as students_attempted
from public.module_attempts ma
group by ma.module_id, ma.difficulty
order by ma.module_id asc, ma.difficulty asc;

revoke all on public.module_completions_by_module_difficulty from anon, authenticated;
