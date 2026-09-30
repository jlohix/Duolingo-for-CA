-- ============================================================
-- Chat Logs — tutor usage analytics (METADATA ONLY)
-- ============================================================
-- Records one row per student question asked to the "Ask the tutor"
-- chatbot, so staff can see WHAT students ask about, HOW MUCH the tutor
-- is used, WHEN it is used, and WHERE lecture content has gaps.
--
-- PRIVACY: this table stores METADATA ONLY. It deliberately does NOT
-- store the question text, the answer text, or the answer options.
-- Every student opts in to the research study before using the app.
--
-- HOW TO USE:
--   1. Open your Supabase project -> SQL Editor -> New query.
--   2. Paste this ENTIRE file.
--   3. Click "Run".
--   4. Verify: Database -> Tables shows `chat_logs`, and
--      Database -> Functions shows log_chat_query, list_chat_logs,
--      list_chat_topic_tally, list_chat_daily, list_chat_by_student.
--
-- Follows the same pattern as the other RPCs in this project: the table
-- is locked down by RLS (no direct anon access); the Edge Function writes
-- via the service role, and admins read via SECURITY DEFINER functions.
-- ============================================================

-- ---------- 1. The table ----------
create table if not exists public.chat_logs (
  id                  uuid primary key default gen_random_uuid(),
  email               text        not null,      -- who asked (student email)
  session_id          text,                      -- groups a burst of questions into one chat session
  topic               text        not null default 'Uncategorized',
  lecture_week        int,                        -- specific lecture week cited (1-13), null if only textbook
  current_question_id text,                      -- practice question on screen (if any)
  on_screen           boolean     not null default false,  -- was it question-linked
  sources             text[]      not null default '{}',   -- lecture materials the tutor cited
  answered            boolean     not null default true,   -- false = "not in course material"
  created_at          timestamptz not null default now()
);

-- Safe to re-run on an existing table: add newer columns if missing.
alter table public.chat_logs add column if not exists lecture_week int;
-- week_inferred = true when lecture_week was GUESSED as the nearest lecture week
-- for a textbook-sourced answer, rather than a slide being directly cited.
alter table public.chat_logs add column if not exists week_inferred boolean not null default false;

-- Lock the table: RLS on, no policies -> no direct anon/authenticated access.
alter table public.chat_logs enable row level security;

-- Helpful indexes for the admin dashboard queries.
create index if not exists chat_logs_created_at_idx   on public.chat_logs (created_at desc);
create index if not exists chat_logs_topic_idx        on public.chat_logs (topic);
create index if not exists chat_logs_email_idx        on public.chat_logs (email);
create index if not exists chat_logs_lecture_week_idx on public.chat_logs (lecture_week);


-- ---------- 2. Write a log row (called by the Edge Function) ----------
-- The Edge Function uses the service role, which bypasses RLS. We still
-- expose this as a SECURITY DEFINER function so the write path is uniform
-- and easy to call. Admins / unknown accounts are filtered OUT by the
-- Edge Function before calling this (they are never logged).
create or replace function public.log_chat_query(
  p_email               text,
  p_session_id          text,
  p_topic               text,
  p_lecture_week        int,
  p_week_inferred       boolean,
  p_current_question_id text,
  p_on_screen           boolean,
  p_sources             text[],
  p_answered            boolean
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(trim(p_email), '') = '' then
    return false;
  end if;

  insert into public.chat_logs
    (email, session_id, topic, lecture_week, week_inferred, current_question_id, on_screen, sources, answered)
  values
    (lower(trim(p_email)),
     nullif(trim(coalesce(p_session_id, '')), ''),
     coalesce(nullif(trim(coalesce(p_topic, '')), ''), 'Uncategorized'),
     case when p_lecture_week between 1 and 13 then p_lecture_week else null end,
     coalesce(p_week_inferred, false),
     nullif(trim(coalesce(p_current_question_id, '')), ''),
     coalesce(p_on_screen, false),
     coalesce(p_sources, '{}'),
     coalesce(p_answered, true));

  return true;
end;
$$;


-- ---------- 3. Admin reads (SECURITY DEFINER) ----------
-- NOTE: admin-only viewing is enforced at the APP level — only the admin
-- screen calls these. Same trade-off as the other list_* RPCs here.

-- 3a. Raw rows (newest first), capped.
create or replace function public.list_chat_logs(p_limit int default 2000)
returns setof public.chat_logs
language sql
security definer
set search_path = public
as $$
  select *
  from public.chat_logs
  order by created_at desc
  limit greatest(1, least(coalesce(p_limit, 2000), 20000));
$$;

-- 3b. Tally of queries per topic + how many were answered.
create or replace function public.list_chat_topic_tally()
returns table (topic text, queries bigint, answered bigint, unanswered bigint)
language sql
security definer
set search_path = public
as $$
  select
    topic,
    count(*)                              as queries,
    count(*) filter (where answered)      as answered,
    count(*) filter (where not answered)  as unanswered
  from public.chat_logs
  group by topic
  order by queries desc;
$$;

-- 3b-ii. Tally of queries per specific lecture week (drill-down).
create or replace function public.list_chat_week_tally()
returns table (
  lecture_week int,
  queries bigint,
  cited bigint,
  inferred bigint,
  unanswered bigint
)
language sql
security definer
set search_path = public
as $$
  select
    lecture_week,
    count(*)                                    as queries,
    count(*) filter (where not week_inferred)   as cited,
    count(*) filter (where week_inferred)       as inferred,
    count(*) filter (where not answered)        as unanswered
  from public.chat_logs
  where lecture_week is not null
  group by lecture_week
  order by lecture_week;
$$;

-- 3c. Daily usage (Singapore local date) for the "uses over time" chart.
create or replace function public.list_chat_daily()
returns table (day date, queries bigint, students bigint)
language sql
security definer
set search_path = public
as $$
  select
    (created_at at time zone 'Asia/Singapore')::date as day,
    count(*)                                          as queries,
    count(distinct email)                             as students
  from public.chat_logs
  group by 1
  order by 1;
$$;

-- 3d. Per-student usage (queries, chat sessions, last used in SGT).
create or replace function public.list_chat_by_student()
returns table (email text, queries bigint, sessions bigint, last_used_sgt timestamptz)
language sql
security definer
set search_path = public
as $$
  select
    email,
    count(*)                                                  as queries,
    count(distinct session_id)                                as sessions,
    (max(created_at) at time zone 'Asia/Singapore')           as last_used_sgt
  from public.chat_logs
  group by email
  order by queries desc;
$$;

-- 3e. Headline totals for the big-number cards.
create or replace function public.chat_usage_summary()
returns table (
  total_queries   bigint,
  unique_students bigint,
  total_sessions  bigint,
  answered        bigint,
  unanswered      bigint
)
language sql
security definer
set search_path = public
as $$
  select
    count(*)                             as total_queries,
    count(distinct email)                as unique_students,
    count(distinct session_id)           as total_sessions,
    count(*) filter (where answered)     as answered,
    count(*) filter (where not answered) as unanswered
  from public.chat_logs;
$$;


-- ---------- 4. Grants ----------
-- The Edge Function calls log_chat_query via the service role, but we also
-- grant it so the write path is uniform. The list_* / summary functions are
-- called by the admin screen using the anon key.
grant execute on function public.log_chat_query(text, text, text, int, boolean, text, boolean, text[], boolean) to anon, authenticated;
grant execute on function public.list_chat_logs(int)          to anon, authenticated;
grant execute on function public.list_chat_topic_tally()      to anon, authenticated;
grant execute on function public.list_chat_week_tally()       to anon, authenticated;
grant execute on function public.list_chat_daily()            to anon, authenticated;
grant execute on function public.list_chat_by_student()       to anon, authenticated;
grant execute on function public.chat_usage_summary()         to anon, authenticated;


-- ============================================================
-- GMT+8 (Asia/Singapore) raw view — APPENDED, nothing dropped.
--   Read it with:  select * from public.chat_logs_sgt;
-- The table and functions above are untouched.
-- ============================================================
create or replace view public.chat_logs_sgt as
select
  c.id,
  c.email,
  c.session_id,
  c.topic,
  c.lecture_week,
  c.week_inferred,
  c.current_question_id,
  c.on_screen,
  c.sources,
  c.answered,
  (c.created_at at time zone 'Asia/Singapore') as created_at_sgt
from public.chat_logs c
order by c.created_at desc;

revoke all on public.chat_logs_sgt from anon, authenticated;
