-- ============================================================
-- Step 2: Make the ASSIGNED class (from authorised_users) authoritative.
-- ============================================================
-- Previously the class came from student_progress.class_id, which the
-- student chose via the ClassPicker. Now each student's class is assigned
-- by staff in authorised_users.class_id. These updated functions read the
-- assigned class from authorised_users and return it as the class, so the
-- app uses the assigned class and any old student-chosen value is ignored.
--
-- PREREQUISITE: authorised_users must have a class_id column, populated
-- with each student's class (Step 1). Run this in the Supabase SQL Editor.
-- Re-running is safe (create or replace).
-- ============================================================

-- get_student_progress: return the ASSIGNED class from authorised_users.
-- classChosen is reported true whenever an assigned class exists, so the
-- app treats the class as settled and does not show the ClassPicker.
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

  -- The assigned class is the source of truth (set by staff).
  select nullif(trim(class_id), '')
    into v_assigned_class
  from public.authorised_users
  where lower(email) = v_email;

  select * into v_row
  from public.student_progress
  where email = v_email;

  if not found then
    -- No progress row yet, but if the student is authorised and has an
    -- assigned class, still return that class so the app skips the picker.
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
        'walkFeedback', '{}'::jsonb,
        'updatedAt', now()
      );
    end if;
    return null;
  end if;

  return jsonb_build_object(
    'email', v_row.email,
    -- Assigned class wins; fall back to stored value only if unassigned.
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
    'walkFeedback', v_row.walk_feedback,
    'updatedAt', v_row.updated_at
  );
end;
$$;

-- list_student_progress: classmate board now uses the ASSIGNED class from
-- authorised_users, and no longer filters on class_chosen (since students
-- no longer choose). Any authorised student with progress is shown.
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
          'completed', sp.completed
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
grant execute on function public.list_student_progress() to anon, authenticated;
