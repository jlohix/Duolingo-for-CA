-- Forgot password: verify matriculation number, then set a new password.
-- Run in Supabase → SQL Editor → Run.

create or replace function public.verify_student_matric(
  p_email text,
  p_matric_number text
)
returns boolean
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
declare
  mail text := lower(trim(p_email));
  secret text := trim(p_matric_number);
  row_hash text;
begin
  if mail = '' or secret = '' then
    return false;
  end if;

  select matric_hash
    into row_hash
  from public.authorised_users
  where lower(email) = mail;

  if row_hash is null then
    return false;
  end if;

  return row_hash = extensions.crypt(secret, row_hash);
end;
$$;

create or replace function public.reset_password_with_matric(
  p_email text,
  p_matric_number text,
  p_new_password text
)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  mail text := lower(trim(p_email));
  secret text := trim(p_matric_number);
  new_pw text := trim(p_new_password);
  row_hash text;
begin
  if mail = '' or secret = '' or char_length(new_pw) < 8 or char_length(new_pw) > 72 then
    return false;
  end if;
  if new_pw = secret then
    return false;
  end if;

  select matric_hash
    into row_hash
  from public.authorised_users
  where lower(email) = mail
  for update;

  if row_hash is null then
    return false;
  end if;

  if row_hash <> extensions.crypt(secret, row_hash) then
    return false;
  end if;

  update public.authorised_users
  set password_hash = extensions.crypt(new_pw, extensions.gen_salt('bf', 10))
  where lower(email) = mail;

  return found;
end;
$$;

revoke all on function public.verify_student_matric(text, text) from public;
grant execute on function public.verify_student_matric(text, text) to anon, authenticated;

revoke all on function public.reset_password_with_matric(text, text, text) from public;
grant execute on function public.reset_password_with_matric(text, text, text) to anon, authenticated;
