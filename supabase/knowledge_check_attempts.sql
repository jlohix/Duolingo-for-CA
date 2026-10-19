-- ============================================================
-- Knowledge check attempts — one row per finished check
-- ============================================================
-- Students finish a Knowledge check (5 step-by-step questions).
-- Each finish is stored here so Profile can list every attempt,
-- not only the first / later summary nested in topic_stats.__kc.
--
-- The app never touches this table with the anon key. It only
-- calls the SECURITY DEFINER RPCs below.
--
-- HOW TO USE:
--   1. Supabase -> SQL Editor -> New query.
--   2. Paste this ENTIRE file and click Run.
-- Re-running is safe.
-- ============================================================

create table if not exists public.knowledge_check_attempts (
  id              uuid primary key default gen_random_uuid(),
  email           text not null,
  topic_id        integer not null,
  attempt_n       integer not null default 1,
  correct         integer not null default 0,
  total           integer not null default 0,
  question_stats  jsonb not null default '[]'::jsonb,
  class_id        text not null default '',
  created_at      timestamptz not null default now()
);

create index if not exists knowledge_check_attempts_email_idx
  on public.knowledge_check_attempts (email, created_at desc);

create index if not exists knowledge_check_attempts_topic_idx
  on public.knowledge_check_attempts (email, topic_id, attempt_n);

alter table public.knowledge_check_attempts enable row level security;

revoke all on table public.knowledge_check_attempts from anon, authenticated;
grant usage on schema public to anon, authenticated;

-- ------------------------------------------------------------
-- log_knowledge_check_attempt: insert one finished check.
-- attempt_n is 1 + how many this student already has for the section.
-- Only known accounts (same pool as login) may write.
-- ------------------------------------------------------------
create or replace function public.log_knowledge_check_attempt(
  p_email text,
  p_topic_id integer,
  p_correct integer default 0,
  p_total integer default 0,
  p_question_stats jsonb default '[]'::jsonb,
  p_class_id text default ''
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_topic integer := coalesce(p_topic_id, 0);
  v_n integer;
begin
  if v_email = '' or v_topic < 1 then
    return false;
  end if;

  if not exists (
    select 1 from public.authorised_users
    where lower(email) = v_email
  ) then
    return false;
  end if;

  select coalesce(max(attempt_n), 0) + 1
    into v_n
  from public.knowledge_check_attempts
  where email = v_email and topic_id = v_topic;

  insert into public.knowledge_check_attempts (
    email,
    topic_id,
    attempt_n,
    correct,
    total,
    question_stats,
    class_id
  )
  values (
    v_email,
    v_topic,
    v_n,
    greatest(coalesce(p_correct, 0), 0),
    greatest(coalesce(p_total, 0), 0),
    coalesce(p_question_stats, '[]'::jsonb),
    coalesce(nullif(trim(p_class_id), ''), '')
  );

  return true;
end;
$$;

-- ------------------------------------------------------------
-- list_my_knowledge_check_attempts: Profile read for one student.
-- ------------------------------------------------------------
create or replace function public.list_my_knowledge_check_attempts(
  p_email text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
begin
  if v_email = '' then
    return '[]'::jsonb;
  end if;

  return coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'id', k.id,
          'email', k.email,
          'topicId', k.topic_id,
          'attempt', k.attempt_n,
          'correct', k.correct,
          'total', k.total,
          'questions', k.question_stats,
          'classId', k.class_id,
          'at', k.created_at
        )
        order by k.topic_id asc, k.attempt_n asc
      )
      from public.knowledge_check_attempts k
      where k.email = v_email
    ),
    '[]'::jsonb
  );
end;
$$;

-- ------------------------------------------------------------
-- list_knowledge_check_attempts: staff read of every row.
-- ------------------------------------------------------------
create or replace function public.list_knowledge_check_attempts()
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
          'id', k.id,
          'email', k.email,
          'topicId', k.topic_id,
          'attempt', k.attempt_n,
          'correct', k.correct,
          'total', k.total,
          'questions', k.question_stats,
          'classId', k.class_id,
          'at', k.created_at
        )
        order by k.email asc, k.topic_id asc, k.attempt_n asc
      )
      from public.knowledge_check_attempts k
    ),
    '[]'::jsonb
  );
end;
$$;

grant execute on function public.log_knowledge_check_attempt(text, integer, integer, integer, jsonb, text) to anon, authenticated;
grant execute on function public.list_my_knowledge_check_attempts(text) to anon, authenticated;
grant execute on function public.list_knowledge_check_attempts() to anon, authenticated;
