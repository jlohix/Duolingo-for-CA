-- ============================================================
-- Profile pictures: store each student's avatar URL.
-- ============================================================
-- The image itself lives in Supabase Storage (bucket: "avatars").
-- Here we only store the public URL string on the student's row and
-- expose it through the existing progress functions.
--
-- RUN in Supabase SQL Editor after student_progress.sql exists.
-- Re-running is safe.
-- ============================================================

-- 1. Add the column (safe if it already exists).
alter table public.student_progress
  add column if not exists avatar_url text not null default '';

-- 2. get_student_progress: include avatarUrl in the returned JSON.
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
    'displayName', v_row.display_name,
    'avatarUrl', v_row.avatar_url,
    'walkFeedback', v_row.walk_feedback,
    'updatedAt', v_row.updated_at
  );
end;
$$;

-- 3. upsert_student_progress: persist avatarUrl from the payload.
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

  if not exists (
    select 1 from public.authorised_users
    where lower(email) = v_email
  ) then
    return false;
  end if;

  insert into public.student_progress as sp (
    email, class_id, class_chosen, xp, streak, last_practice_date,
    completed, unlocked_by_skip, topic_stats, league_index,
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
    greatest(coalesce((p_data->>'leagueIndex')::integer, 0), 0),
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
    league_index = excluded.league_index,
    display_name = excluded.display_name,
    avatar_url = excluded.avatar_url,
    walk_feedback = excluded.walk_feedback,
    updated_at = now();

  return true;
end;
$$;

-- 4. list_student_progress: include avatarUrl for the boards.
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
          'avatarUrl', sp.avatar_url
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

grant execute on function public.get_student_progress(text) to anon, authenticated;
grant execute on function public.upsert_student_progress(text, jsonb) to anon, authenticated;
grant execute on function public.list_student_progress() to anon, authenticated;
