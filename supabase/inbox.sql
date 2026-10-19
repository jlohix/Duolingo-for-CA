-- ============================================================
-- Circuito inbox — bell notifications for assignments + reports
-- ============================================================
-- Students open the bell (top left) to read messages.
-- Staff post assignments from the Students page.
-- Marking a question report Resolved also messages the reporter.
--
-- HOW TO USE:
--   1. Supabase -> SQL Editor -> New query.
--   2. Paste this ENTIRE file -> Run.
-- Re-running is safe.
-- ============================================================

create table if not exists public.inbox_messages (
  id          uuid primary key default gen_random_uuid(),
  kind        text        not null default 'assignment'
                check (kind in ('assignment', 'report_resolved')),
  title       text        not null,
  body        text,
  class_id    text,                 -- null = every class
  recipient   text,                 -- null = broadcast; else student email
  source_id   text,                 -- e.g. report:<uuid> (dedupe)
  created_by  text,
  created_at  timestamptz not null default now()
);

create table if not exists public.inbox_reads (
  email       text        not null,
  message_id  uuid        not null references public.inbox_messages(id)
                on delete cascade,
  read_at     timestamptz not null default now(),
  primary key (email, message_id)
);

alter table public.inbox_messages enable row level security;
alter table public.inbox_reads enable row level security;

create index if not exists inbox_messages_created_idx
  on public.inbox_messages (created_at desc);
create index if not exists inbox_messages_recipient_idx
  on public.inbox_messages (recipient);
create unique index if not exists inbox_messages_source_uidx
  on public.inbox_messages (kind, source_id)
  where source_id is not null;

-- ---------- List messages for one student ----------
create or replace function public.list_inbox(p_email text, p_class_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
  v_class text := nullif(upper(trim(p_class_id)), '');
begin
  if v_email is null or v_email = '' then
    return '[]'::jsonb;
  end if;

  return coalesce(
    (
      select jsonb_agg(row_to_json(x) order by x."createdAt" desc)
      from (
        select
          m.id,
          m.kind,
          m.title,
          m.body,
          m.class_id as "classId",
          m.recipient,
          m.created_at as "createdAt",
          exists (
            select 1 from public.inbox_reads r
            where r.email = v_email and r.message_id = m.id
          ) as read
        from public.inbox_messages m
        where
          (
            m.recipient is null
            and (m.class_id is null or m.class_id = v_class)
          )
          or lower(m.recipient) = v_email
        order by m.created_at desc
        limit 80
      ) x
    ),
    '[]'::jsonb
  );
end;
$$;

-- ---------- Mark one / all read ----------
create or replace function public.mark_inbox_read(p_email text, p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
begin
  if v_email is null or v_email = '' or p_id is null then
    return false;
  end if;
  insert into public.inbox_reads (email, message_id)
  values (v_email, p_id)
  on conflict (email, message_id) do nothing;
  return true;
end;
$$;

create or replace function public.mark_inbox_read_all(p_email text, p_class_id text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
  v_class text := nullif(upper(trim(p_class_id)), '');
begin
  if v_email is null or v_email = '' then
    return false;
  end if;
  insert into public.inbox_reads (email, message_id)
  select v_email, m.id
  from public.inbox_messages m
  where
    (
      m.recipient is null
      and (m.class_id is null or m.class_id = v_class)
    )
    or lower(m.recipient) = v_email
  on conflict (email, message_id) do nothing;
  return true;
end;
$$;

-- ---------- Staff: post an assignment / notice ----------
create or replace function public.create_inbox_message(
  p_kind       text,
  p_title      text,
  p_body       text,
  p_class_id   text,
  p_recipient  text,
  p_created_by text,
  p_source_id  text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_kind text := case
    when p_kind = 'report_resolved' then 'report_resolved'
    else 'assignment'
  end;
begin
  if coalesce(trim(p_title), '') = '' then
    raise exception 'Title is required';
  end if;

  begin
    insert into public.inbox_messages
      (kind, title, body, class_id, recipient, source_id, created_by)
    values (
      v_kind,
      trim(p_title),
      nullif(trim(coalesce(p_body, '')), ''),
      nullif(upper(trim(coalesce(p_class_id, ''))), ''),
      nullif(lower(trim(coalesce(p_recipient, ''))), ''),
      nullif(trim(coalesce(p_source_id, '')), ''),
      nullif(trim(coalesce(p_created_by, '')), '')
    )
    returning id into v_id;
  exception
    when unique_violation then
      select id into v_id
      from public.inbox_messages
      where kind = v_kind
        and source_id = nullif(trim(coalesce(p_source_id, '')), '')
      limit 1;
  end;

  return v_id;
end;
$$;

-- ---------- Staff: list posted assignments ----------
create or replace function public.list_inbox_admin()
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(
    jsonb_agg(row_to_json(x) order by x."createdAt" desc),
    '[]'::jsonb
  )
  from (
    select
      m.id,
      m.kind,
      m.title,
      m.body,
      m.class_id as "classId",
      m.recipient,
      m.created_by as "createdBy",
      m.created_at as "createdAt"
    from public.inbox_messages m
    where m.kind = 'assignment'
    order by m.created_at desc
    limit 80
  ) x;
$$;

create or replace function public.delete_inbox_message(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.inbox_messages where id = p_id;
  return found;
end;
$$;

-- ---------- When a report is resolved, message the reporter ----------
create or replace function public.resolve_question_report(
  p_id       uuid,
  p_resolved boolean
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reporter text;
  v_qid text;
  v_was boolean;
begin
  select reporter, question_id, resolved
    into v_reporter, v_qid, v_was
  from public.question_reports
  where id = p_id;

  if not found then
    return false;
  end if;

  update public.question_reports
  set resolved = coalesce(p_resolved, true)
  where id = p_id;

  if coalesce(p_resolved, true) = true
     and v_was is distinct from true
     and v_reporter is not null
     and position('@' in v_reporter) > 1 then
    begin
      insert into public.inbox_messages
        (kind, title, body, recipient, source_id, created_by)
      values (
        'report_resolved',
        'We reviewed your report',
        'Thanks for reporting question ' || coalesce(nullif(trim(v_qid), ''), 'in Circuito')
          || '. We have looked at it and marked your report as resolved.',
        lower(trim(v_reporter)),
        'report:' || p_id::text,
        'circuito'
      );
    exception
      when unique_violation then
        null;
    end;
  end if;

  return true;
end;
$$;

grant execute on function public.list_inbox(text, text) to anon, authenticated;
grant execute on function public.mark_inbox_read(text, uuid) to anon, authenticated;
grant execute on function public.mark_inbox_read_all(text, text) to anon, authenticated;
grant execute on function public.create_inbox_message(text, text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.list_inbox_admin() to anon, authenticated;
grant execute on function public.delete_inbox_message(uuid) to anon, authenticated;
grant execute on function public.resolve_question_report(uuid, boolean) to anon, authenticated;
