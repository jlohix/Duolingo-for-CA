-- ============================================================
-- Announcements — login pop-up notices (admin-managed)
-- ============================================================
-- Students see active announcements as a dismissible pop-up on login.
-- Admins create / edit / delete / terminate them in the Admin dashboard.
--
-- Date window: starts_at / ends_at are stored UTC. Admin input is interpreted
-- as Asia/Singapore. ends_at NULL = open-ended (runs until terminated).
--
-- HOW TO USE:
--   1. Supabase -> SQL Editor -> New query -> paste this ENTIRE file -> Run.
--   2. For images: Supabase -> Storage -> create a PUBLIC bucket named
--      `announcements` (same as the existing `avatars` bucket).
--   3. Verify: Database -> Tables shows `announcements`; Functions shows
--      create/update/delete/terminate/list_* announcement functions.
--
-- Safe to re-run (idempotent). Same RLS-no-policy + SECURITY DEFINER pattern
-- as question_reports.sql.
-- ============================================================

-- ---------- 1. Table ----------
create table if not exists public.announcements (
  id          uuid primary key default gen_random_uuid(),
  title       text        not null,
  description text,
  image_url   text,                                   -- optional image (public Storage URL)
  starts_at   timestamptz not null default now(),     -- window start (UTC)
  ends_at     timestamptz,                            -- window end (UTC); null = open-ended
  frequency   text        not null default 'once'
                check (frequency in ('once', 'recurring')),
  active      boolean     not null default true,       -- false = terminated
  created_by  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Accent colour for the student pop-up (hex string, e.g. '#ffd43b').
-- Safe to re-run on an existing table.
alter table public.announcements add column if not exists color text;

-- Lock the table: RLS on, no policies -> no direct anon access; RPCs only.
alter table public.announcements enable row level security;

create index if not exists announcements_window_idx on public.announcements (starts_at, ends_at);
create index if not exists announcements_created_idx on public.announcements (created_at desc);


-- ---------- 2. Create (admin) ----------
-- p_starts_at / p_ends_at are text; empty/null p_starts_at = now, empty/null
-- p_ends_at = open-ended. Non-empty values are interpreted as Asia/Singapore
-- wall-clock and stored as the correct UTC instant.
create or replace function public.create_announcement(
  p_title       text,
  p_description text,
  p_image_url   text,
  p_starts_at   text,
  p_ends_at     text,
  p_frequency   text,
  p_created_by  text,
  p_color       text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_starts timestamptz;
  v_ends   timestamptz;
begin
  if coalesce(trim(p_title), '') = '' then
    raise exception 'Title is required';
  end if;

  v_starts := case
    when coalesce(trim(p_starts_at), '') = '' then now()
    else (p_starts_at::timestamp at time zone 'Asia/Singapore')
  end;

  v_ends := case
    when coalesce(trim(p_ends_at), '') = '' then null
    else (p_ends_at::timestamp at time zone 'Asia/Singapore')
  end;

  insert into public.announcements
    (title, description, image_url, starts_at, ends_at, frequency, created_by, color)
  values (
    trim(p_title),
    nullif(trim(coalesce(p_description, '')), ''),
    nullif(trim(coalesce(p_image_url, '')), ''),
    v_starts,
    v_ends,
    case when p_frequency = 'recurring' then 'recurring' else 'once' end,
    nullif(trim(coalesce(p_created_by, '')), ''),
    nullif(trim(coalesce(p_color, '')), '')
  )
  returning id into v_id;

  return v_id;
end;
$$;


-- ---------- 3. Update (admin) ----------
create or replace function public.update_announcement(
  p_id          uuid,
  p_title       text,
  p_description text,
  p_image_url   text,
  p_starts_at   text,
  p_ends_at     text,
  p_frequency   text,
  p_active      boolean,
  p_color       text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_starts timestamptz;
  v_ends   timestamptz;
begin
  if coalesce(trim(p_title), '') = '' then
    raise exception 'Title is required';
  end if;

  v_starts := case
    when coalesce(trim(p_starts_at), '') = '' then now()
    else (p_starts_at::timestamp at time zone 'Asia/Singapore')
  end;
  v_ends := case
    when coalesce(trim(p_ends_at), '') = '' then null
    else (p_ends_at::timestamp at time zone 'Asia/Singapore')
  end;

  update public.announcements
  set
    title       = trim(p_title),
    description = nullif(trim(coalesce(p_description, '')), ''),
    image_url   = nullif(trim(coalesce(p_image_url, '')), ''),
    starts_at   = v_starts,
    ends_at     = v_ends,
    frequency   = case when p_frequency = 'recurring' then 'recurring' else 'once' end,
    active      = coalesce(p_active, true),
    color       = nullif(trim(coalesce(p_color, '')), ''),
    updated_at  = now()
  where id = p_id;

  return found;
end;
$$;


-- ---------- 4. Terminate now (admin) ----------
-- Immediately stop showing: deactivate and clamp the end to now.
create or replace function public.terminate_announcement(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.announcements
  set active = false,
      ends_at = least(coalesce(ends_at, now()), now()),
      updated_at = now()
  where id = p_id;
  return found;
end;
$$;


-- ---------- 5. Delete (admin) ----------
create or replace function public.delete_announcement(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.announcements where id = p_id;
  return found;
end;
$$;


-- ---------- 6. List active (students) ----------
-- Active + within the date window right now. Newest first.
create or replace function public.list_active_announcements()
returns setof public.announcements
language sql
security definer
set search_path = public
as $$
  select *
  from public.announcements
  where active = true
    and starts_at <= now()
    and (ends_at is null or ends_at >= now())
  order by created_at desc;
$$;


-- ---------- 7. List all (admin) ----------
-- Every announcement, with ACTIVE ones first, then by newest. The app also
-- highlights active rows; this ordering puts them on top.
create or replace function public.list_announcements()
returns table (
  id          uuid,
  title       text,
  description text,
  image_url   text,
  color       text,
  starts_at   timestamptz,
  ends_at     timestamptz,
  frequency   text,
  active      boolean,
  is_live     boolean,     -- active AND currently within the window
  created_by  text,
  created_at  timestamptz,
  updated_at  timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    a.id, a.title, a.description, a.image_url, a.color,
    a.starts_at, a.ends_at, a.frequency, a.active,
    (a.active and a.starts_at <= now() and (a.ends_at is null or a.ends_at >= now())) as is_live,
    a.created_by, a.created_at, a.updated_at
  from public.announcements a
  order by
    (a.active and a.starts_at <= now() and (a.ends_at is null or a.ends_at >= now())) desc,
    a.created_at desc;
$$;


-- ---------- 8. Grants ----------
-- Drop the older (pre-color) overloads if they exist, so only the current
-- signatures remain (adding a param via CREATE OR REPLACE makes a NEW overload;
-- we don't want two versions callable). Safe no-ops if they aren't present.
drop function if exists public.create_announcement(text, text, text, text, text, text, text);
drop function if exists public.update_announcement(uuid, text, text, text, text, text, text, boolean);

grant execute on function public.create_announcement(text, text, text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.update_announcement(uuid, text, text, text, text, text, text, boolean, text) to anon, authenticated;
grant execute on function public.terminate_announcement(uuid) to anon, authenticated;
grant execute on function public.delete_announcement(uuid) to anon, authenticated;
grant execute on function public.list_active_announcements() to anon, authenticated;
grant execute on function public.list_announcements() to anon, authenticated;


-- ============================================================
-- GMT+8 (Asia/Singapore) view for staff — safe to re-run.
-- ============================================================
drop view if exists public.announcements_sgt;
create view public.announcements_sgt as
select
  a.id,
  a.title,
  a.description,
  a.image_url,
  a.color,
  (a.starts_at at time zone 'Asia/Singapore') as starts_at_sgt,
  (a.ends_at   at time zone 'Asia/Singapore') as ends_at_sgt,
  a.frequency,
  a.active,
  a.created_by,
  (a.created_at at time zone 'Asia/Singapore') as created_at_sgt
from public.announcements a
order by a.created_at desc;

revoke all on public.announcements_sgt from anon, authenticated;
