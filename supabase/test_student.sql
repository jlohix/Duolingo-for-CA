-- Circuito test students for cross-device progress sync.
-- Run in Supabase → SQL Editor → Run.
-- Also run student_progress.sql once if you have not already.
--
-- Logins (first time: email + matric; then set a password):
--   test001@e.ntu.edu.sg  /  TestMatric1
--   test002@e.ntu.edu.sg  /  TestMatric2

insert into public.authorised_users (email, matric_hash)
values
  (
    lower(trim('test001@e.ntu.edu.sg')),
    extensions.crypt('TestMatric1', extensions.gen_salt('bf', 10))
  ),
  (
    lower(trim('test002@e.ntu.edu.sg')),
    extensions.crypt('TestMatric2', extensions.gen_salt('bf', 10))
  )
on conflict (email) do update
set matric_hash = excluded.matric_hash;

-- Clear passwords so first login uses matric, then asks for a new password.
update public.authorised_users
set password_hash = null
where email in ('test001@e.ntu.edu.sg', 'test002@e.ntu.edu.sg')
  and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'authorised_users'
      and column_name = 'password_hash'
  );

-- Optional clean slate for sync testing (safe if table missing).
do $$
begin
  if to_regclass('public.student_progress') is not null then
    delete from public.student_progress
    where email in ('test001@e.ntu.edu.sg', 'test002@e.ntu.edu.sg');
  end if;
end $$;

select email
from public.authorised_users
where email in ('test001@e.ntu.edu.sg', 'test002@e.ntu.edu.sg')
order by email;
