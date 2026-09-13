-- ============================================================
-- Trophy leagues: store the tier name, and settle promotions
-- on a shared 3-day clock in Supabase (not per-browser).
-- ============================================================
-- RUN in the Supabase SQL Editor after profile_pictures.sql.
-- Re-running is safe.
--
-- What this does:
--   * Adds student_progress.trophy_tier (bronze, silver, gold, …)
--   * Returns leagueIndex + trophyTier from get/list progress
--   * Keeps trophy_tier in sync with league_index
--   * Adds league_season + sync_league_season() so the top 20%
--     promote and the bottom 20% demote every 3 days for everyone
-- ============================================================

alter table public.student_progress
  add column if not exists trophy_tier text not null default 'bronze';

create or replace function public.trophy_tier_from_index(p_index integer)
returns text
language sql
immutable
as $$
  select (array[
    'bronze',
    'silver',
    'gold',
    'sapphire',
    'ruby',
    'emerald',
    'amethyst',
    'pearl',
    'obsidian',
    'diamond'
  ])[least(10, greatest(1, coalesce(p_index, 0) + 1))];
$$;

drop function if exists public.league_zone_counts(integer);

create or replace function public.league_zone_counts(p_total bigint)
returns jsonb
language sql
immutable
as $$
  select case
    when coalesce(p_total, 0) <= 1 then
      jsonb_build_object('promote', 0, 'demote', 0)
    else jsonb_build_object(
      'promote', case
        when greatest(1, round((p_total * 0.2)::numeric)::integer)
           + greatest(1, round((p_total * 0.2)::numeric)::integer) >= p_total
        then 1
        else greatest(1, round((p_total * 0.2)::numeric)::integer)
      end,
      'demote', case
        when greatest(1, round((p_total * 0.2)::numeric)::integer)
           + greatest(1, round((p_total * 0.2)::numeric)::integer) >= p_total
        then case when p_total > 1 then 1 else 0 end
        else greatest(1, round((p_total * 0.2)::numeric)::integer)
      end
    )
  end;
$$;

create or replace function public.student_progress_sync_trophy_tier()
returns trigger
language plpgsql
as $$
begin
  new.trophy_tier := public.trophy_tier_from_index(new.league_index);
  return new;
end;
$$;

drop trigger if exists student_progress_trophy_tier on public.student_progress;
create trigger student_progress_trophy_tier
before insert or update of league_index, trophy_tier
on public.student_progress
for each row
execute procedure public.student_progress_sync_trophy_tier();

update public.student_progress
set trophy_tier = public.trophy_tier_from_index(league_index)
where trophy_tier is distinct from public.trophy_tier_from_index(league_index);

create table if not exists public.league_season (
  id integer primary key default 1 check (id = 1),
  season_start timestamptz not null,
  start_xp jsonb not null default '{}'::jsonb
);

-- First run: backdate 3 days so the overdue round settles immediately
-- (ranked by total XP this once), then a real 3-day season begins.
insert into public.league_season (id, season_start, start_xp)
values (1, now() - interval '3 days', '{}'::jsonb)
on conflict (id) do nothing;

alter table public.league_season enable row level security;
revoke all on table public.league_season from anon, authenticated;

-- get_student_progress: assigned class + avatar + trophy tier
create or replace function public.get_student_progress(p_email text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
  v_row public.student_progress%rowtype;
  v_assigned_class text;
begin
  if v_email is null or v_email = '' then
    return null;
  end if;

  select nullif(trim(class_id), '')
    into v_assigned_class
  from public.authorised_users
  where lower(email) = v_email;

  select * into v_row
  from public.student_progress
  where email = v_email;

  if not found then
    if v_assigned_class is not null then
      return jsonb_build_object(
        'email', v_email,
        'classId', v_assigned_class,
        'classChosen', true,
        'xp', 0,
        'streak', 0,
        'lastPracticeDate', '',
        'completed', '[]'::jsonb,
        'unlockedBySkip', '[]'::jsonb,
        'topicStats', '{}'::jsonb,
        'leagueIndex', 0,
        'trophyTier', 'bronze',
        'displayName', '',
        'avatarUrl', '',
        'walkFeedback', '{}'::jsonb,
        'updatedAt', now()
      );
    end if;
    return null;
  end if;

  return jsonb_build_object(
    'email', v_row.email,
    'classId', coalesce(v_assigned_class, v_row.class_id),
    'classChosen', case when v_assigned_class is not null then true
                        else v_row.class_chosen end,
    'xp', v_row.xp,
    'streak', v_row.streak,
    'lastPracticeDate', v_row.last_practice_date,
    'completed', v_row.completed,
    'unlockedBySkip', v_row.unlocked_by_skip,
    'topicStats', v_row.topic_stats,
    'leagueIndex', v_row.league_index,
    'trophyTier', public.trophy_tier_from_index(v_row.league_index),
    'displayName', v_row.display_name,
    'avatarUrl', v_row.avatar_url,
    'walkFeedback', v_row.walk_feedback,
    'updatedAt', v_row.updated_at
  );
end;
$$;

create or replace function public.upsert_student_progress(p_email text, p_data jsonb)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
  v_league integer;
begin
  if v_email is null or v_email = '' or p_data is null then
    return false;
  end if;

  if not exists (
    select 1 from public.authorised_users
    where lower(email) = v_email
  ) then
    return false;
  end if;

  v_league := greatest(coalesce((p_data->>'leagueIndex')::integer, 0), 0);

  insert into public.student_progress as sp (
    email, class_id, class_chosen, xp, streak, last_practice_date,
    completed, unlocked_by_skip, topic_stats, league_index, trophy_tier,
    display_name, avatar_url, walk_feedback, updated_at
  )
  values (
    v_email,
    coalesce(nullif(trim(p_data->>'classId'), ''), 'EE01'),
    coalesce((p_data->>'classChosen')::boolean, false),
    greatest(coalesce((p_data->>'xp')::integer, 0), 0),
    greatest(coalesce((p_data->>'streak')::integer, 0), 0),
    coalesce(p_data->>'lastPracticeDate', ''),
    coalesce(p_data->'completed', '[]'::jsonb),
    coalesce(p_data->'unlockedBySkip', '[]'::jsonb),
    coalesce(p_data->'topicStats', '{}'::jsonb),
    v_league,
    public.trophy_tier_from_index(v_league),
    coalesce(p_data->>'displayName', ''),
    coalesce(p_data->>'avatarUrl', ''),
    coalesce(p_data->'walkFeedback', '{}'::jsonb),
    now()
  )
  on conflict (email) do update set
    class_id = excluded.class_id,
    class_chosen = excluded.class_chosen,
    xp = excluded.xp,
    streak = excluded.streak,
    last_practice_date = excluded.last_practice_date,
    completed = excluded.completed,
    unlocked_by_skip = excluded.unlocked_by_skip,
    topic_stats = excluded.topic_stats,
    -- league_index / trophy_tier are owned by sync_league_season so a
    -- stale client cannot wipe a promotion or undo a demotion.
    display_name = excluded.display_name,
    avatar_url = excluded.avatar_url,
    walk_feedback = excluded.walk_feedback,
    updated_at = now();

  return true;
end;
$$;

create or replace function public.list_student_progress()
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
          'email', sp.email,
          'username', sp.email,
          'display', nullif(trim(sp.display_name), ''),
          'classId', coalesce(nullif(trim(au.class_id), ''), sp.class_id),
          'class_id', coalesce(nullif(trim(au.class_id), ''), sp.class_id),
          'xp', sp.xp,
          'streak', sp.streak,
          'topicStats', sp.topic_stats,
          'completed', sp.completed,
          'avatarUrl', sp.avatar_url,
          'leagueIndex', sp.league_index,
          'league_index', sp.league_index,
          'trophyTier', public.trophy_tier_from_index(sp.league_index),
          'trophy_tier', public.trophy_tier_from_index(sp.league_index)
        )
        order by sp.xp desc, sp.email asc
      )
      from public.student_progress sp
      join public.authorised_users au on lower(au.email) = sp.email
      where nullif(trim(au.class_id), '') is not null
    ),
    '[]'::jsonb
  );
end;
$$;

create or replace function public.sync_league_season()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_start timestamptz;
  v_start_xp jsonb;
  v_guard integer := 0;
  v_duration interval := interval '3 days';
  v_league_index jsonb;
  v_trophy_tier jsonb;
begin
  insert into public.league_season (id, season_start, start_xp)
  values (1, v_now - v_duration, '{}'::jsonb)
  on conflict (id) do nothing;

  select season_start, start_xp
    into v_start, v_start_xp
  from public.league_season
  where id = 1;

  if v_start_xp is null or v_start_xp = '{}'::jsonb then
    select coalesce(jsonb_object_agg(sp.email, to_jsonb(sp.xp)), '{}'::jsonb)
      into v_start_xp
    from public.student_progress sp
    join public.authorised_users au on lower(au.email) = sp.email
    where nullif(trim(au.class_id), '') is not null;
  end if;

  while v_now >= v_start + v_duration and v_guard < 24 loop
    -- New classmates join mid-round with 0 season XP.
    select v_start_xp || coalesce(jsonb_object_agg(sp.email, to_jsonb(sp.xp)), '{}'::jsonb)
      into v_start_xp
    from public.student_progress sp
    join public.authorised_users au on lower(au.email) = sp.email
    where nullif(trim(au.class_id), '') is not null
      and not v_start_xp ? sp.email;

    with ranked as (
      select
        sp.email,
        least(9, greatest(0, sp.league_index)) as league_index,
        row_number() over (
          partition by least(9, greatest(0, sp.league_index))
          order by
            greatest(
              0,
              sp.xp - coalesce((v_start_xp->>sp.email)::integer, sp.xp)
            ) desc,
            sp.xp desc,
            sp.email asc
        ) as rank,
        count(*) over (
          partition by least(9, greatest(0, sp.league_index))
        ) as n
      from public.student_progress sp
      join public.authorised_users au on lower(au.email) = sp.email
      where nullif(trim(au.class_id), '') is not null
    ),
    moved as (
      select
        email,
        case
          when n > 1
            and rank <= coalesce((public.league_zone_counts(n::integer)->>'promote')::integer, 0)
            then least(9, league_index + 1)
          when n > 1
            and coalesce((public.league_zone_counts(n::integer)->>'demote')::integer, 0) > 0
            and rank > n - coalesce((public.league_zone_counts(n::integer)->>'demote')::integer, 0)
            then greatest(0, league_index - 1)
          else league_index
        end as new_index
      from ranked
    )
    update public.student_progress sp
    set
      league_index = moved.new_index,
      trophy_tier = public.trophy_tier_from_index(moved.new_index)
    from moved
    where sp.email = moved.email
      and sp.league_index is distinct from moved.new_index;

    select coalesce(jsonb_object_agg(sp.email, to_jsonb(sp.xp)), '{}'::jsonb)
      into v_start_xp
    from public.student_progress sp
    join public.authorised_users au on lower(au.email) = sp.email
    where nullif(trim(au.class_id), '') is not null;

    v_start := v_start + v_duration;
    v_guard := v_guard + 1;
  end loop;

  -- Snapshot anyone who joined during the current round.
  select v_start_xp || coalesce(jsonb_object_agg(sp.email, to_jsonb(sp.xp)), '{}'::jsonb)
    into v_start_xp
  from public.student_progress sp
  join public.authorised_users au on lower(au.email) = sp.email
  where nullif(trim(au.class_id), '') is not null
    and not v_start_xp ? sp.email;

  update public.league_season
  set season_start = v_start, start_xp = v_start_xp
  where id = 1;

  select
    coalesce(jsonb_object_agg(sp.email, to_jsonb(sp.league_index)), '{}'::jsonb),
    coalesce(
      jsonb_object_agg(
        sp.email,
        to_jsonb(public.trophy_tier_from_index(sp.league_index))
      ),
      '{}'::jsonb
    )
    into v_league_index, v_trophy_tier
  from public.student_progress sp
  join public.authorised_users au on lower(au.email) = sp.email
  where nullif(trim(au.class_id), '') is not null;

  return jsonb_build_object(
    'seasonStart', (extract(epoch from v_start) * 1000)::bigint,
    'remainMs', greatest(
      0,
      (extract(epoch from (v_start + v_duration - v_now)) * 1000)::bigint
    ),
    'startXp', v_start_xp,
    'leagueIndex', v_league_index,
    'trophyTier', v_trophy_tier
  );
end;
$$;

grant execute on function public.trophy_tier_from_index(integer) to anon, authenticated;
grant execute on function public.league_zone_counts(bigint) to anon, authenticated;
grant execute on function public.get_student_progress(text) to anon, authenticated;
grant execute on function public.upsert_student_progress(text, jsonb) to anon, authenticated;
grant execute on function public.list_student_progress() to anon, authenticated;
grant execute on function public.sync_league_season() to anon, authenticated;
