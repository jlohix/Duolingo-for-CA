-- ============================================================
-- Module visit tracking — which module a user opened & how long
-- ============================================================
-- Each time a user navigates into a module (a lesson, lab, past-year
-- paper, section walk, leaderboard, profile, etc.) the app starts a
-- "visit" row and keeps updating its duration while they stay there.
-- When they leave the module (navigate away / hide / close the tab)
-- the app flushes the final duration.
--
-- This complements session_times.sql (which tracks whole-site time):
-- module_visits breaks that time down per module.
--
-- The app never touches this table directly with the anon key; it only
-- calls the SECURITY DEFINER RPCs below (same pattern as
-- session_times.sql / student_progress.sql).
--
-- HOW TO USE:
--   1. Supabase project -> SQL Editor -> New query.
--   2. Paste this ENTIRE file and click Run.
--   3. Confirm table:  public.module_visits
--   4. Confirm functions: log_module_visit, list_module_visits
--
-- HOW THE TEAM READS / EXPORTS THE DATA (SQL Editor, postgres role):
--   select * from public.module_times_logged;      -- per visit, sorted
--   select * from public.module_times_totals;       -- per user + module
-- Use the "Download CSV" button on the results to export.
--
-- TIMEZONE: timestamps are STORED in UTC (timestamptz + now(), the correct,
-- non-destructive way). The original views/RPC keep UTC. For GMT+8
-- (Asia/Singapore) local time, use the ADDITIONAL *_sgt views appended at
-- the END of this file. Nothing is dropped or altered.
-- ============================================================

create table if not exists public.module_visits (
  -- Client-generated UUID for this single module visit.
  visit_id     uuid primary key,
  -- Links the visit back to a browsing session (session_times.session_id).
  session_id   uuid,
  email        text not null,
  class_id     text not null default '',
  -- Which module: a stable screen key, e.g. 'home', 'lesson', 'dragthevlab',
  -- 'leagues', 'profile', 'paper', 'secwalk', 'laplacelab', ...
  module_key   text not null,
  -- Finer detail when available, e.g. '2-1' (topicId-difficulty),
  -- 'bank-<id>-<difficulty>', a paper id, a section-walk key, etc.
  module_detail text not null default '',
  -- A human label for convenience in reports (falls back to module_key).
  module_label text not null default '',
  entered_at   timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  duration_seconds integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists module_visits_email_idx
  on public.module_visits (email);

create index if not exists module_visits_module_key_idx
  on public.module_visits (module_key);

create index if not exists module_visits_entered_at_idx
  on public.module_visits (entered_at desc);

alter table public.module_visits enable row level security;

-- No direct table access from the anon key; only the RPCs below.
revoke all on table public.module_visits from anon, authenticated;
grant usage on schema public to anon, authenticated;

-- ------------------------------------------------------------
-- log_module_visit: upsert a visit's running duration.
-- Called on entering a module, on periodic heartbeat, and on the final
-- flush when the user leaves. Only known accounts may write.
-- ------------------------------------------------------------
create or replace function public.log_module_visit(
  p_visit_id uuid,
  p_email text,
  p_module_key text,
  p_duration_seconds integer,
  p_module_detail text default '',
  p_module_label text default '',
  p_class_id text default '',
  p_session_id uuid default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_key text := nullif(trim(coalesce(p_module_key, '')), '');
  v_dur integer := greatest(coalesce(p_duration_seconds, 0), 0);
begin
  if p_visit_id is null or v_email = '' or v_key is null then
    return false;
  end if;

  -- Only known accounts (same guard used by upsert_student_progress).
  if not exists (
    select 1 from public.authorised_users
    where lower(email) = v_email
  ) then
    return false;
  end if;

  insert into public.module_visits as mv (
    visit_id,
    session_id,
    email,
    class_id,
    module_key,
    module_detail,
    module_label,
    entered_at,
    last_seen_at,
    duration_seconds
  )
  values (
    p_visit_id,
    p_session_id,
    v_email,
    coalesce(nullif(trim(p_class_id), ''), ''),
    v_key,
    coalesce(nullif(trim(p_module_detail), ''), ''),
    coalesce(nullif(trim(p_module_label), ''), v_key),
    now(),
    now(),
    v_dur
  )
  on conflict (visit_id) do update set
    -- Duration only ever grows (guards against out-of-order flushes).
    duration_seconds = greatest(mv.duration_seconds, excluded.duration_seconds),
    class_id = case
      when excluded.class_id <> '' then excluded.class_id else mv.class_id end,
    module_detail = case
      when excluded.module_detail <> '' then excluded.module_detail else mv.module_detail end,
    module_label = case
      when excluded.module_label <> '' then excluded.module_label else mv.module_label end,
    session_id = coalesce(mv.session_id, excluded.session_id),
    last_seen_at = now(),
    updated_at = now();

  return true;
end;
$$;

-- ------------------------------------------------------------
-- list_module_visits: staff-facing read of all visits, returned sorted
-- by user (email), then module, then entry time. Timestamps in UTC.
-- ------------------------------------------------------------
create or replace function public.list_module_visits()
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
          'visitId', mv.visit_id,
          'sessionId', mv.session_id,
          'email', mv.email,
          'classId', mv.class_id,
          'moduleKey', mv.module_key,
          'moduleDetail', mv.module_detail,
          'moduleLabel', mv.module_label,
          'enteredAt', mv.entered_at,
          'lastSeenAt', mv.last_seen_at,
          'durationSeconds', mv.duration_seconds
        )
        order by mv.email asc, mv.module_key asc, mv.entered_at asc
      )
      from public.module_visits mv
    ),
    '[]'::jsonb
  );
end;
$$;

grant execute on function
  public.log_module_visit(uuid, text, text, integer, text, text, text, uuid) to anon, authenticated;
grant execute on function public.list_module_visits() to anon, authenticated;

-- ============================================================
-- Reporting view: module_times_logged  (UTC)
-- ------------------------------------------------------------
-- One row per module visit, sorted by user then module then entry time.
-- ============================================================
create or replace view public.module_times_logged as
select
  mv.email,
  mv.class_id,
  mv.module_key,
  mv.module_detail,
  mv.module_label,
  mv.visit_id,
  mv.session_id,
  mv.entered_at,
  mv.last_seen_at,
  mv.duration_seconds,
  round(mv.duration_seconds / 60.0, 2) as duration_minutes,
  to_char((mv.duration_seconds || ' seconds')::interval, 'HH24:MI:SS') as duration_hms,
  round(mv.duration_seconds / 3600.0, 2) as duration_hours
from public.module_visits mv
order by mv.email asc, mv.module_key asc, mv.entered_at asc;

revoke all on public.module_times_logged from anon, authenticated;

-- ------------------------------------------------------------
-- Per-user + per-module totals (how long each user spent in each module).
-- ------------------------------------------------------------
create or replace view public.module_times_totals as
select
  mv.email,
  mv.module_key,
  mv.module_label,
  count(*)                                as visits,
  sum(mv.duration_seconds)                as total_seconds,
  round(sum(mv.duration_seconds) / 60.0, 2) as total_minutes,
  min(mv.entered_at)                      as first_seen,
  max(mv.last_seen_at)                    as last_seen,
  round(sum(mv.duration_seconds) / 3600.0, 2) as total_hours
from public.module_visits mv
group by mv.email, mv.module_key, mv.module_label
order by mv.email asc, total_seconds desc;

revoke all on public.module_times_totals from anon, authenticated;

-- ============================================================
-- GMT+8 (Asia/Singapore) reporting views — APPENDED, nothing dropped
-- ------------------------------------------------------------
-- Separate views presenting the same data with timestamps converted to
-- Singapore local time (UTC+8). Stored columns + UTC views are untouched.
--   Export the SGT CSV from:  select * from public.module_times_logged_sgt;
-- ============================================================
create or replace view public.module_times_logged_sgt as
select
  mv.email,
  mv.class_id,
  mv.module_key,
  mv.module_detail,
  mv.module_label,
  mv.visit_id,
  mv.session_id,
  -- Converted to GMT+8 wall-clock time (source stays UTC).
  (mv.entered_at   at time zone 'Asia/Singapore') as entered_at_sgt,
  (mv.last_seen_at at time zone 'Asia/Singapore') as last_seen_at_sgt,
  mv.duration_seconds,
  round(mv.duration_seconds / 60.0, 2) as duration_minutes,
  to_char((mv.duration_seconds || ' seconds')::interval, 'HH24:MI:SS') as duration_hms,
  round(mv.duration_seconds / 3600.0, 2) as duration_hours
from public.module_visits mv
order by mv.email asc, mv.module_key asc, mv.entered_at asc;

revoke all on public.module_times_logged_sgt from anon, authenticated;

create or replace view public.module_times_totals_sgt as
select
  mv.email,
  mv.module_key,
  mv.module_label,
  count(*)                                as visits,
  sum(mv.duration_seconds)                as total_seconds,
  round(sum(mv.duration_seconds) / 60.0, 2) as total_minutes,
  -- Converted to GMT+8 wall-clock time (source stays UTC).
  (min(mv.entered_at)   at time zone 'Asia/Singapore') as first_seen_sgt,
  (max(mv.last_seen_at) at time zone 'Asia/Singapore') as last_seen_sgt,
  round(sum(mv.duration_seconds) / 3600.0, 2) as total_hours
from public.module_visits mv
group by mv.email, mv.module_key, mv.module_label
order by mv.email asc, total_seconds desc;

revoke all on public.module_times_totals_sgt from anon, authenticated;
