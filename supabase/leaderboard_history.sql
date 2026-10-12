-- ============================================================
-- Weekly leaderboard HISTORY — archive each completed period
-- ============================================================
-- Depends on supabase/leaderboard_period.sql (run that first). This adds a
-- history table and makes the reset archive the just-ended period's standings
-- so students and staff can scroll back through previous weeks.
--
-- Lightweight: for each completed period we store, per student, the XP EARNED
-- that period, their rank, and their class (enough to redisplay the board).
--
-- NOTE: history can only be recorded from the moment this is deployed. Periods
-- that already elapsed were never snapshotted and cannot be back-filled.
--
-- HOW TO USE: Supabase -> SQL Editor -> paste this ENTIRE file -> Run.
-- Safe to re-run (idempotent).
-- ============================================================

-- ---------- 1. History tables ----------
-- One row per completed period.
create table if not exists public.leaderboard_period_history (
  id            bigint generated always as identity primary key,
  period_index  integer not null,          -- 1 = first completed period, 2, 3, ...
  period_start  timestamptz not null,       -- when that period began (UTC)
  period_end    timestamptz not null,       -- when it ended / was archived (UTC)
  recur_weeks   integer not null default 1,
  created_at    timestamptz not null default now(),
  unique (period_start)
);

-- One row per student per completed period (the frozen standings).
create table if not exists public.leaderboard_history_entry (
  history_id   bigint not null references public.leaderboard_period_history(id) on delete cascade,
  email        text   not null,
  class_id     text,
  xp_earned    integer not null default 0,
  rank         integer not null,
  primary key (history_id, email)
);
create index if not exists leaderboard_history_entry_hist_idx
  on public.leaderboard_history_entry (history_id);

alter table public.leaderboard_period_history enable row level security;
alter table public.leaderboard_history_entry  enable row level security;
revoke all on table public.leaderboard_period_history from anon, authenticated;
revoke all on table public.leaderboard_history_entry  from anon, authenticated;


-- ---------- 2. Archive helper: freeze a just-ended period ----------
-- Given the period that is ending (its start time + the start_xp snapshot taken
-- at its beginning), compute each student's XP earned during it + rank, and
-- store a history row. Called from sync_leaderboard_period at each reset.
create or replace function public.archive_leaderboard_period(
  p_period_start timestamptz,
  p_period_end   timestamptz,
  p_start_xp     jsonb,
  p_recur_weeks  integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_index   integer;
  v_hist_id bigint;
begin
  -- Skip empty snapshots (e.g. the very first bootstrap with no data).
  if p_start_xp is null or p_start_xp = '{}'::jsonb then
    return;
  end if;

  -- Don't double-archive the same period.
  if exists (select 1 from public.leaderboard_period_history where period_start = p_period_start) then
    return;
  end if;

  select coalesce(max(period_index), 0) + 1
    into v_index
  from public.leaderboard_period_history;

  insert into public.leaderboard_period_history
    (period_index, period_start, period_end, recur_weeks)
  values
    (v_index, p_period_start, p_period_end, greatest(1, coalesce(p_recur_weeks, 1)))
  returning id into v_hist_id;

  insert into public.leaderboard_history_entry (history_id, email, class_id, xp_earned, rank)
  select
    v_hist_id,
    sp.email,
    coalesce(nullif(trim(au.class_id), ''), sp.class_id) as class_id,
    greatest(0, sp.xp - coalesce((p_start_xp->>sp.email)::integer, sp.xp)) as xp_earned,
    row_number() over (
      order by
        greatest(0, sp.xp - coalesce((p_start_xp->>sp.email)::integer, sp.xp)) desc,
        sp.xp desc,
        sp.email asc
    ) as rank
  from public.student_progress sp
  join public.authorised_users au on lower(au.email) = sp.email
  where nullif(trim(au.class_id), '') is not null;
end;
$$;


-- ---------- 3. Replace sync to archive the ending period at each reset ----------
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
    -- Archive the period that just ended BEFORE overwriting its snapshot.
    -- (Only when there was a real prior period with a non-empty snapshot.)
    if v_period_start is not null and v_start_xp is not null and v_start_xp <> '{}'::jsonb
       and v_cur_boundary > v_period_start then
      perform public.archive_leaderboard_period(
        v_period_start, v_cur_boundary, v_start_xp, v_recur
      );
    end if;

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


-- ---------- 4. Read RPCs (students + admins) ----------
-- List all completed periods, newest first (for the "previous weeks" dropdown).
create or replace function public.list_leaderboard_history()
returns table (
  id             bigint,
  period_index   integer,
  period_start_sgt timestamptz,
  period_end_sgt   timestamptz,
  recur_weeks    integer,
  entries        bigint
)
language sql
security definer
set search_path = public
as $$
  select
    h.id,
    h.period_index,
    (h.period_start at time zone 'Asia/Singapore') as period_start_sgt,
    (h.period_end   at time zone 'Asia/Singapore') as period_end_sgt,
    h.recur_weeks,
    (select count(*) from public.leaderboard_history_entry e where e.history_id = h.id) as entries
  from public.leaderboard_period_history h
  order by h.period_index desc;
$$;

-- The frozen standings for one past period. Optional class filter.
create or replace function public.get_leaderboard_history(p_history_id bigint, p_class text default null)
returns table (
  email     text,
  class_id  text,
  xp_earned integer,
  rank      integer
)
language sql
security definer
set search_path = public
as $$
  select e.email, e.class_id, e.xp_earned, e.rank
  from public.leaderboard_history_entry e
  where e.history_id = p_history_id
    and (
      p_class is null
      or nullif(trim(p_class), '') is null
      or upper(e.class_id) = upper(trim(p_class))
    )
  order by e.rank asc;
$$;


-- ---------- 5. Grants ----------
grant execute on function public.list_leaderboard_history()               to anon, authenticated;
grant execute on function public.get_leaderboard_history(bigint, text)    to anon, authenticated;
-- archive helper stays internal:
revoke all on function public.archive_leaderboard_period(timestamptz, timestamptz, jsonb, integer) from anon, authenticated;
