-- ============================================================
-- Weekly leaderboard period — INDEPENDENT of the trophy-league season
-- ============================================================
-- Adds a configurable, recurring "leaderboard period" (default: weekly,
-- resetting Tuesday 00:00 Asia/Singapore) used to rank students by XP EARNED
-- THIS PERIOD on the Class / Cohort / Individual leaderboards. This is separate
-- from league_season (the 3-day trophy season), which is left untouched.
--
-- XP is NEVER wiped. Each reset takes a snapshot (start_xp) of every student's
-- total XP; "weekly XP" = current xp - snapshot. Lifetime XP keeps growing.
--
-- HOW TO USE:
--   1. Supabase -> Database -> Extensions: enable `pg_cron` (one time).
--   2. Supabase -> SQL Editor -> New query -> paste this ENTIRE file -> Run.
--   3. Verify: Database -> Tables shows leaderboard_config + leaderboard_period;
--      `select * from cron.job;` shows the hourly sync job.
--
-- Safe to re-run (idempotent): tables use IF NOT EXISTS, functions use CREATE
-- OR REPLACE, the view is dropped+recreated, and the cron job is re-registered.
-- ============================================================

create extension if not exists pg_cron;

-- ---------- 1. Config (admin-set schedule) ----------
-- anchor_dow:   ISO day of week the period boundary falls on (1=Mon .. 7=Sun).
-- anchor_time:  local (Asia/Singapore) time of day of the boundary.
-- recur_weeks:  1 = weekly, 2 = bi-weekly.
create table if not exists public.leaderboard_config (
  id          integer primary key default 1 check (id = 1),
  anchor_dow  integer not null default 2 check (anchor_dow between 1 and 7),  -- 2 = Tuesday
  anchor_time time    not null default '00:00',
  recur_weeks integer not null default 1 check (recur_weeks between 1 and 8),
  updated_at  timestamptz not null default now()
);
insert into public.leaderboard_config (id) values (1) on conflict (id) do nothing;

alter table public.leaderboard_config enable row level security;
revoke all on table public.leaderboard_config from anon, authenticated;

-- ---------- 2. Current period state ----------
-- period_start: timestamptz (UTC) when the current period began.
-- start_xp:     per-email snapshot of total XP at period_start.
create table if not exists public.leaderboard_period (
  id           integer primary key default 1 check (id = 1),
  period_start timestamptz not null default now(),
  start_xp     jsonb       not null default '{}'::jsonb
);
insert into public.leaderboard_period (id, period_start, start_xp)
values (1, now(), '{}'::jsonb) on conflict (id) do nothing;

alter table public.leaderboard_period enable row level security;
revoke all on table public.leaderboard_period from anon, authenticated;


-- ---------- 3. Helper: the most recent boundary at/just before a timestamp ----------
-- Given the config, returns the latest period-boundary instant (UTC) that is
-- <= p_now. Boundaries recur every (recur_weeks * 7) days, anchored on the
-- configured day-of-week + time, interpreted in Asia/Singapore.
create or replace function public.leaderboard_boundary_at_or_before(p_now timestamptz)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  v_dow        integer;
  v_time       time;
  v_recur      integer;
  v_period_days integer;
  v_now_sgt    timestamptz;      -- p_now as a local SGT wall-clock timestamp
  v_today_sgt  date;
  v_now_dow    integer;          -- ISO dow of today in SGT
  v_delta      integer;          -- days back to the anchor weekday
  v_anchor_sgt timestamp;        -- most recent anchor (local wall clock), <= now
  v_anchor_utc timestamptz;
begin
  select anchor_dow, anchor_time, recur_weeks
    into v_dow, v_time, v_recur
  from public.leaderboard_config where id = 1;

  v_recur := greatest(1, coalesce(v_recur, 1));
  v_period_days := v_recur * 7;

  -- Local SGT view of "now".
  v_now_sgt := p_now at time zone 'Asia/Singapore';   -- timestamp (local wall clock)
  v_today_sgt := v_now_sgt::date;
  v_now_dow := extract(isodow from v_today_sgt)::integer;

  -- Days back from today to the most recent configured weekday.
  v_delta := (v_now_dow - v_dow + 7) % 7;
  v_anchor_sgt := (v_today_sgt - v_delta)::timestamp + v_time;

  -- If that anchor is still in the future today (time not yet reached), step
  -- back one week to the previous occurrence.
  if v_anchor_sgt > v_now_sgt then
    v_anchor_sgt := v_anchor_sgt - interval '7 days';
  end if;

  -- v_anchor_sgt is the most recent WEEKLY occurrence of the weekday+time.
  v_anchor_utc := v_anchor_sgt at time zone 'Asia/Singapore';

  -- For bi-weekly (or longer): the weekly anchor might land on an "off" week.
  -- Count whole weeks between a fixed reference date and this anchor, then step
  -- back (weeks mod recur_weeks) weeks so boundaries fall on a stable grid.
  -- Done with a single bounded calculation (no loop) to avoid runaway/underflow.
  if v_recur > 1 then
    declare
      -- Fixed reference anchor (a Monday) to measure week parity against.
      v_ref date := date '2024-01-01';
      v_weeks integer;
      v_offset integer;
    begin
      v_weeks := floor(
        (v_anchor_utc::date - v_ref)::numeric / 7.0
      )::integer;
      v_offset := ((v_weeks % v_recur) + v_recur) % v_recur;  -- 0..recur-1
      if v_offset > 0 then
        v_anchor_utc := v_anchor_utc - (v_offset * 7 || ' days')::interval;
      end if;
    end;
  end if;

  return v_anchor_utc;
end;
$$;


-- ---------- 4. Sync / advance the period (called hourly by cron + on load) ----------
-- If the current period's boundary has passed, snapshot XP and advance.
-- Returns { periodStart, nextReset, weeklyXp:{email->gained} } (ms epochs).
create or replace function public.sync_leaderboard_period()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now           timestamptz := now();
  v_cur_boundary  timestamptz;
  v_period_start  timestamptz;
  v_start_xp      jsonb;
  v_recur         integer;
  v_period_days   integer;
  v_next          timestamptz;
  v_weekly        jsonb;
begin
  select recur_weeks into v_recur from public.leaderboard_config where id = 1;
  v_recur := greatest(1, coalesce(v_recur, 1));
  v_period_days := v_recur * 7;

  v_cur_boundary := public.leaderboard_boundary_at_or_before(v_now);

  select period_start, start_xp
    into v_period_start, v_start_xp
  from public.leaderboard_period where id = 1;

  -- First run or the period boundary has advanced: take a fresh snapshot.
  if v_period_start is null or v_start_xp = '{}'::jsonb or v_cur_boundary > v_period_start then
    select coalesce(jsonb_object_agg(sp.email, to_jsonb(sp.xp)), '{}'::jsonb)
      into v_start_xp
    from public.student_progress sp
    join public.authorised_users au on lower(au.email) = sp.email
    where nullif(trim(au.class_id), '') is not null;

    v_period_start := v_cur_boundary;

    update public.leaderboard_period
    set period_start = v_period_start, start_xp = v_start_xp
    where id = 1;
  else
    -- Within the current period: make sure students who joined mid-period get a
    -- snapshot (so their weekly XP starts at ~0, not their lifetime total).
    select v_start_xp || coalesce(jsonb_object_agg(sp.email, to_jsonb(sp.xp)), '{}'::jsonb)
      into v_start_xp
    from public.student_progress sp
    join public.authorised_users au on lower(au.email) = sp.email
    where nullif(trim(au.class_id), '') is not null
      and not v_start_xp ? sp.email;

    update public.leaderboard_period set start_xp = v_start_xp where id = 1;
  end if;

  -- Weekly XP earned so far this period, per email.
  select coalesce(
           jsonb_object_agg(
             sp.email,
             to_jsonb(greatest(0, sp.xp - coalesce((v_start_xp->>sp.email)::integer, sp.xp)))
           ),
           '{}'::jsonb
         )
    into v_weekly
  from public.student_progress sp
  join public.authorised_users au on lower(au.email) = sp.email
  where nullif(trim(au.class_id), '') is not null;

  v_next := v_period_start + (v_period_days || ' days')::interval;

  return jsonb_build_object(
    'periodStart', (extract(epoch from v_period_start) * 1000)::bigint,
    'nextReset',   (extract(epoch from v_next) * 1000)::bigint,
    'recurWeeks',  v_recur,
    'weeklyXp',    v_weekly
  );
end;
$$;


-- ---------- 5. Config read / write (admin) ----------
create or replace function public.get_leaderboard_config()
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'anchorDow',  anchor_dow,
    'anchorTime', to_char(anchor_time, 'HH24:MI'),
    'recurWeeks', recur_weeks,
    'updatedAt',  updated_at
  )
  from public.leaderboard_config where id = 1;
$$;

create or replace function public.set_leaderboard_config(
  p_anchor_dow  integer,
  p_anchor_time text,
  p_recur_weeks integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.leaderboard_config
  set
    anchor_dow  = least(7, greatest(1, coalesce(p_anchor_dow, 2))),
    anchor_time = coalesce(nullif(trim(p_anchor_time), ''), '00:00')::time,
    recur_weeks = least(8, greatest(1, coalesce(p_recur_weeks, 1))),
    updated_at  = now()
  where id = 1;

  -- Re-anchor the current period to the new schedule immediately.
  perform public.sync_leaderboard_period();

  return public.get_leaderboard_config();
end;
$$;


-- ---------- 6. Grants (same anon-RPC pattern as the rest of the app) ----------
grant execute on function public.sync_leaderboard_period()            to anon, authenticated;
grant execute on function public.get_leaderboard_config()             to anon, authenticated;
grant execute on function public.set_leaderboard_config(integer, text, integer) to anon, authenticated;
-- boundary helper is internal, but harmless to expose; keep it private:
revoke all on function public.leaderboard_boundary_at_or_before(timestamptz) from anon, authenticated;


-- ---------- 7. Schedule the reset check hourly (pg_cron) ----------
-- The function itself decides whether a boundary passed, so an hourly tick is
-- enough and automatically respects schedule changes made in-app.
do $$
begin
  -- Remove any prior registration so re-running this file doesn't duplicate it.
  perform cron.unschedule('leaderboard_period_sync')
  where exists (select 1 from cron.job where jobname = 'leaderboard_period_sync');
exception when others then
  -- ignore if cron schema/job not present yet
  null;
end $$;

select cron.schedule(
  'leaderboard_period_sync',
  '0 * * * *',                       -- top of every hour
  $$ select public.sync_leaderboard_period(); $$
);


-- ============================================================
-- GMT+8 (Asia/Singapore) period view — safe to re-run.
-- ============================================================
drop view if exists public.leaderboard_period_sgt;
create view public.leaderboard_period_sgt as
select
  p.id,
  (p.period_start at time zone 'Asia/Singapore') as period_start_sgt,
  p.start_xp
from public.leaderboard_period p;

revoke all on public.leaderboard_period_sgt from anon, authenticated;
