-- Circuito: persist XP, streak, class, topic stats (strengths/weaknesses), etc.
-- Run this in the Supabase SQL editor after authorised_users exists.
-- App calls: get_student_progress, upsert_student_progress, list_student_progress

create table if not exists public.student_progress (
  email text primary key,
  class_id text not null default 'EE01',
  class_chosen boolean not null default false,
  xp integer not null default 0,
  streak integer not null default 0,
  last_practice_date text not null default '',
  completed jsonb not null default '[]'::jsonb,
  unlocked_by_skip jsonb not null default '[]'::jsonb,
  topic_stats jsonb not null default '{}'::jsonb,
  league_index integer not null default 0,
  display_name text not null default '',
  walk_feedback jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists student_progress_class_id_idx
  on public.student_progress (class_id);

alter table public.student_progress enable row level security;

-- No direct table access from the anon key; only SECURITY DEFINER RPCs below.
revoke all on table public.student_progress from anon, authenticated;
grant usage on schema public to anon, authenticated;

create or replace function public.get_student_progress(p_email text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
  v_row public.student_progress%rowtype;
begin
  if v_email is null or v_email = '' then
    return null;
  end if;

  select * into v_row
  from public.student_progress
  where email = v_email;

  if not found then
    return null;
  end if;

  return jsonb_build_object(
    'email', v_row.email,
    'classId', v_row.class_id,
    'classChosen', v_row.class_chosen,
    'xp', v_row.xp,
    'streak', v_row.streak,
    'lastPracticeDate', v_row.last_practice_date,
    'completed', v_row.completed,
    'unlockedBySkip', v_row.unlocked_by_skip,
    'topicStats', v_row.topic_stats,
    'leagueIndex', v_row.league_index,
    'displayName', v_row.display_name,
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
begin
  if v_email is null or v_email = '' or p_data is null then
    return false;
  end if;

  -- Only known accounts (same pool as login).
  if not exists (
    select 1 from public.authorised_users
    where lower(email) = v_email
  ) then
    return false;
  end if;

  insert into public.student_progress as sp (
    email,
    class_id,
    class_chosen,
    xp,
    streak,
    last_practice_date,
    completed,
    unlocked_by_skip,
    topic_stats,
    league_index,
    display_name,
    walk_feedback,
    updated_at
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
    greatest(coalesce((p_data->>'leagueIndex')::integer, 0), 0),
    coalesce(p_data->>'displayName', ''),
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
    league_index = excluded.league_index,
    display_name = excluded.display_name,
    walk_feedback = excluded.walk_feedback,
    updated_at = now();

  return true;
end;
$$;

-- Public board fields for classmates (no walk feedback).
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
          'classId', sp.class_id,
          'class_id', sp.class_id,
          'xp', sp.xp,
          'streak', sp.streak,
          'topicStats', sp.topic_stats,
          'completed', sp.completed
        )
        order by sp.xp desc, sp.email asc
      )
      from public.student_progress sp
      where sp.class_chosen = true
    ),
    '[]'::jsonb
  );
end;
$$;

grant execute on function public.get_student_progress(text) to anon, authenticated;
grant execute on function public.upsert_student_progress(text, jsonb) to anon, authenticated;
grant execute on function public.list_student_progress() to anon, authenticated;
