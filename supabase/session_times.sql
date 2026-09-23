-- ============================================================
-- Session time tracking — how long each user spends on the site
-- ============================================================
-- Every time a user opens the app we start a "session" (a row) and
-- keep updating its duration while they browse. When they leave
-- (tab hidden / closed) the app flushes the final duration.
--
-- The app never touches this table directly with the anon key; it
-- only calls the SECURITY DEFINER RPCs below (same pattern as
-- student_progress.sql / student_consent.sql).
--
-- HOW TO USE:
--   1. Supabase project -> SQL Editor -> New query.
--   2. Paste this ENTIRE file and click Run.
--   3. Confirm table:  public.session_times
--   4. Confirm functions: log_session_time, list_session_times
--
-- HOW THE TEAM READS / EXPORTS THE DATA (SQL Editor, postgres role):
--   select * from public.user_times_logged;      -- sorted by user, then time
-- Then use the "Download CSV" button in the SQL Editor results, or the
-- helper query at the bottom of this file, to produce user_times_logged.csv.
-- ============================================================

create table if not exists public.session_times (
  -- Client-generated UUID for the browsing session (stable across heartbeats).
  session_id   uuid primary key,
  email        text not null,
  class_id     text not null default '',
  -- When the session started and was last seen (heartbeat / flush).
  started_at   timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  -- Total time on site for this session, in whole seconds.
  duration_seconds integer not null default 0,
  -- Lightweight context; helpful when analysing engagement.
  user_agent   text not null default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists session_times_email_idx
  on public.session_times (email);

create index if not exists session_times_started_at_idx
  on public.session_times (started_at desc);

alter table public.session_times enable row level security;

-- No direct table access from the anon key; only the RPCs below.
revoke all on table public.session_times from anon, authenticated;
grant usage on schema public to anon, authenticated;

-- ------------------------------------------------------------
-- log_session_time: upsert a session's running duration.
-- Called on start, on periodic heartbeat, and on final flush.
-- Only known accounts (same pool as login) may write.
-- ------------------------------------------------------------
create or replace function public.log_session_time(
  p_session_id uuid,
  p_email text,
  p_duration_seconds integer,
  p_class_id text default '',
  p_user_agent text default ''
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_dur integer := greatest(coalesce(p_duration_seconds, 0), 0);
begin
  if p_session_id is null or v_email = '' then
    return false;
  end if;

  -- Only known accounts (same guard used by upsert_student_progress).
  if not exists (
    select 1 from public.authorised_users
    where lower(email) = v_email
  ) then
    return false;
  end if;

  insert into public.session_times as st (
    session_id,
    email,
    class_id,
    started_at,
    last_seen_at,
    duration_seconds,
    user_agent
  )
  values (
    p_session_id,
    v_email,
    coalesce(nullif(trim(p_class_id), ''), ''),
    now(),
    now(),
    v_dur,
    left(coalesce(p_user_agent, ''), 400)
  )
  on conflict (session_id) do update set
    -- Duration only ever grows (guards against out-of-order flushes).
    duration_seconds = greatest(st.duration_seconds, excluded.duration_seconds),
    class_id = case
      when excluded.class_id <> '' then excluded.class_id else st.class_id end,
    user_agent = case
      when excluded.user_agent <> '' then excluded.user_agent else st.user_agent end,
    last_seen_at = now(),
    updated_at = now();

  return true;
end;
$$;

-- ------------------------------------------------------------
-- list_session_times: staff-facing read of all sessions,
-- returned sorted by user (email) then by start time.
-- ------------------------------------------------------------
create or replace function public.list_session_times()
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
          'sessionId', st.session_id,
          'email', st.email,
          'classId', st.class_id,
          'startedAt', st.started_at,
          'lastSeenAt', st.last_seen_at,
          'durationSeconds', st.duration_seconds
        )
        order by st.email asc, st.started_at asc
      )
      from public.session_times st
    ),
    '[]'::jsonb
  );
end;
$$;

grant execute on function
  public.log_session_time(uuid, text, integer, text, text) to anon, authenticated;
grant execute on function public.list_session_times() to anon, authenticated;

-- ============================================================
-- Reporting view: user_times_logged
-- ------------------------------------------------------------
-- One row per browsing session, sorted by user then by start time,
-- with human-friendly duration columns. Export this to get the
-- user_times_logged.csv file the team wants.
-- ============================================================
create or replace view public.user_times_logged as
select
  st.email,
  st.class_id,
  st.session_id,
  st.started_at,
  st.last_seen_at,
  st.duration_seconds,
  round(st.duration_seconds / 60.0, 2) as duration_minutes,
  round(st.duration_seconds / 3600.0, 2) as duration_hours,
  -- HH:MM:SS pretty print
  to_char((st.duration_seconds || ' seconds')::interval, 'HH24:MI:SS') as duration_hms
from public.session_times st
order by st.email asc, st.started_at asc;

-- Anon/authenticated cannot read the view directly (staff use it in SQL Editor).
revoke all on public.user_times_logged from anon, authenticated;

-- ------------------------------------------------------------
-- Per-user totals (handy summary; also sorted by user).
-- ------------------------------------------------------------
create or replace view public.user_times_totals as
select
  st.email,
  count(*)                                as sessions,
  sum(st.duration_seconds)                as total_seconds,
  round(sum(st.duration_seconds) / 60.0, 2) as total_minutes,
  round(sum(st.duration_seconds) / 3600.0, 2) as total_hours,
  min(st.started_at)                      as first_seen,
  max(st.last_seen_at)                    as last_seen
from public.session_times st
group by st.email
order by st.email asc;

revoke all on public.user_times_totals from anon, authenticated;

-- ------------------------------------------------------------
-- OPTIONAL: export user_times_logged.csv straight from Postgres.
-- Requires running as a role with server-side file access (e.g. via
-- Supabase SQL Editor this usually is NOT permitted, so prefer the
-- "Download CSV" button on the results of:  select * from public.user_times_logged; )
--
--   copy (select * from public.user_times_logged)
--     to '/tmp/user_times_logged.csv' with (format csv, header true);
-- ------------------------------------------------------------
