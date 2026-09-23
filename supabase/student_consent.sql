-- ============================================================
-- Student informed consent — encrypted storage + RPCs
-- ============================================================
-- Students see a blocking consent sheet on first login. Their
-- answers are encrypted in Postgres (pgcrypto) so the anon key
-- cannot read the payload. Staff decrypt in the SQL Editor.
--
-- HOW TO USE:
--   1. Supabase project -> SQL Editor -> New query.
--   2. Paste this ENTIRE file and click Run.
--   3. Confirm tables: student_consent, private.consent_crypto
--   4. Confirm functions: get_student_consent_status,
--      record_student_consent
--
-- HOW THE TEAM READS ANSWERS (SQL Editor, postgres role):
--   select * from public.student_consent_decrypted;
--
-- The encryption key is generated once and stored in
-- private.consent_crypto (not granted to anon). Keep a backup
-- of that row; without it old payloads cannot be decrypted.
-- ============================================================

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create extension if not exists pgcrypto with schema extensions;

create table if not exists private.consent_crypto (
  id int primary key default 1 check (id = 1),
  secret text not null
);

insert into private.consent_crypto (id, secret)
values (1, encode(extensions.gen_random_bytes(32), 'hex'))
on conflict (id) do nothing;

create table if not exists public.student_consent (
  email text primary key,
  answers_enc bytea not null,
  research_opt_in boolean not null default false,
  form_version text not null default 'leads-2026-09',
  submitted_at timestamptz not null default now()
);

alter table public.student_consent enable row level security;

create index if not exists student_consent_submitted_at_idx
  on public.student_consent (submitted_at desc);

create or replace function private.consent_secret()
returns text
language sql
stable
security definer
set search_path = private, extensions, public
as $$
  select secret from private.consent_crypto where id = 1;
$$;

revoke all on function private.consent_secret() from public, anon, authenticated;

create or replace function public.get_student_consent_status(p_email text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.student_consent%rowtype;
  v_email text := lower(trim(coalesce(p_email, '')));
begin
  if v_email = '' then
    return jsonb_build_object('recorded', false, 'research_opt_in', false);
  end if;

  select * into row
  from public.student_consent
  where student_consent.email = v_email;
  if not found then
    return jsonb_build_object('recorded', false, 'research_opt_in', false);
  end if;

  return jsonb_build_object(
    'recorded', true,
    'research_opt_in', row.research_opt_in,
    -- submitted_at returned as GMT+8 (Asia/Singapore); stored as UTC.
    'submitted_at', to_char(row.submitted_at at time zone 'Asia/Singapore', 'YYYY-MM-DD"T"HH24:MI:SS')
  );
end;
$$;

create or replace function public.record_student_consent(
  p_email text,
  p_answers jsonb
)
returns boolean
language plpgsql
security definer
set search_path = public, extensions, private
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  study text := lower(trim(coalesce(p_answers->>'study', '')));
  future_data text := lower(trim(coalesce(p_answers->>'futureData', '')));
  future_scope text := lower(trim(coalesce(p_answers->>'futureDataScope', '')));
  future_contact text := lower(trim(coalesce(p_answers->>'futureContact', '')));
  contact_email boolean := coalesce((p_answers->'contactEmail') = 'true'::jsonb, false);
  payload jsonb;
  secret text;
begin
  if v_email = '' or position('@' in v_email) = 0 then
    return false;
  end if;
  if study not in ('yes', 'no') then
    return false;
  end if;
  if future_data not in ('yes', 'no') then
    return false;
  end if;
  if future_data = 'yes' and future_scope not in ('unrestricted', 'nala') then
    return false;
  end if;
  if future_contact not in ('yes', 'no') then
    return false;
  end if;
  if future_contact = 'yes' and contact_email is not true then
    return false;
  end if;

  payload := jsonb_build_object(
    'study', study,
    'futureData', future_data,
    'futureDataScope', case when future_data = 'yes' then future_scope else null end,
    'futureContact', future_contact,
    'contactEmail', case when future_contact = 'yes' then true else false end,
    'formVersion', coalesce(nullif(trim(p_answers->>'formVersion'), ''), 'leads-2026-09'),
    'submittedAt', to_char(timezone('Asia/Singapore', now()), 'YYYY-MM-DD"T"HH24:MI:SS "GMT+8"')
  );

  secret := private.consent_secret();
  if coalesce(secret, '') = '' then
    return false;
  end if;

  insert into public.student_consent (
    email,
    answers_enc,
    research_opt_in,
    form_version,
    submitted_at
  )
  values (
    v_email,
    extensions.pgp_sym_encrypt(payload::text, secret),
    study = 'yes',
    payload->>'formVersion',
    now()
  )
  on conflict (email) do update
  set
    answers_enc = excluded.answers_enc,
    research_opt_in = excluded.research_opt_in,
    form_version = excluded.form_version,
    submitted_at = now();

  return true;
end;
$$;

-- Team-only decrypted view. Anon cannot select this (RLS + no grant).
-- Drop first: CREATE OR REPLACE VIEW cannot change an existing column's
-- data type (submitted_at timestamptz -> timestamp), so re-running errors 42P16.
drop view if exists public.student_consent_decrypted;
create view public.student_consent_decrypted as
select
  c.email,
  c.research_opt_in,
  c.form_version,
  -- submitted_at shown in GMT+8 (Asia/Singapore); stored as UTC.
  (c.submitted_at at time zone 'Asia/Singapore') as submitted_at,
  (extensions.pgp_sym_decrypt(c.answers_enc, k.secret))::jsonb as answers
from public.student_consent c
cross join private.consent_crypto k
where k.id = 1;

revoke all on public.student_consent from public, anon, authenticated;
revoke all on public.student_consent_decrypted from public, anon, authenticated;
grant execute on function public.get_student_consent_status(text) to anon, authenticated;
grant execute on function public.record_student_consent(text, jsonb) to anon, authenticated;
