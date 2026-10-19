-- Circuito: 0 season XP cannot promote.
-- Run this in the Supabase SQL Editor after trophy_leagues.sql.
-- Re-running is safe. Only replaces sync_league_season().

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
        greatest(
          0,
          sp.xp - coalesce((v_start_xp->>sp.email)::integer, sp.xp)
        ) as season_xp,
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
            and season_xp > 0
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

grant execute on function public.sync_league_season() to anon, authenticated;
