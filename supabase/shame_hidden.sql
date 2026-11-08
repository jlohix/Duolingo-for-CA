-- ============================================================
-- Dashboard of Shame — hidden entries (admin-managed, shared)
-- ============================================================
-- Admins can hide individual change entries so students don't see them.
-- The hidden set is shared via the database, so every student's app hides
-- the same entries. Admins still see hidden entries (greyed out) with a
-- Show button to unhide.
--
-- `entry_id` is the Dashboard-of-Shame entry id, which is stable for both
-- git-derived entries (e.g. '0b967ba0-opamp.csv-202-2') and manual override
-- entries (e.g. 'override-opamp-202-2').
--
-- HOW TO USE:
--   1. Supabase -> SQL Editor -> New query -> paste this ENTIRE file -> Run.
--   2. Verify: Database -> Tables shows `shame_hidden`; Functions shows
--      set_shame_hidden / list_shame_hidden.
--
-- Safe to re-run (idempotent). Same RLS-no-policy + SECURITY DEFINER pattern
-- as announcements.sql / question_overrides.sql.
-- ============================================================

-- ---------- 1. Table ----------
create table if not exists public.shame_hidden (
  entry_id   text primary key,            -- Dashboard-of-Shame entry id
  hidden_by  text,
  created_at timestamptz not null default now()
);

-- Lock the table: RLS on, no policies -> no direct anon access; RPCs only.
alter table public.shame_hidden enable row level security;


-- ---------- 2. Set hidden state (admin) ----------
-- p_hidden = true inserts the id (hide); false removes it (show). Returns the
-- resulting hidden state (true = now hidden, false = now visible).
create or replace function public.set_shame_hidden(
  p_entry_id  text,
  p_hidden    boolean,
  p_hidden_by text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_entry_id is null or length(trim(p_entry_id)) = 0 then
    return false;
  end if;
  if p_hidden then
    insert into public.shame_hidden (entry_id, hidden_by)
    values (p_entry_id, p_hidden_by)
    on conflict (entry_id) do update set hidden_by = excluded.hidden_by;
    return true;
  else
    delete from public.shame_hidden where entry_id = p_entry_id;
    return false;
  end if;
end;
$$;


-- ---------- 3. List hidden ids (everyone) ----------
create or replace function public.list_shame_hidden()
returns setof public.shame_hidden
language sql
security definer
set search_path = public
as $$
  select * from public.shame_hidden order by created_at desc;
$$;


-- ---------- 4. Grants ----------
grant execute on function public.set_shame_hidden(text, boolean, text)
  to anon, authenticated;
grant execute on function public.list_shame_hidden() to anon, authenticated;
