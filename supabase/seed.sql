-- Admin seed (run in Supabase SQL editor)
-- 1) Create the user first (Supabase Auth users table or signup in app)
-- 2) Replace the email below with the admin user's email

-- Upsert profile and grant admin role
insert into public.profiles (id, name, email, role, updated_at)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'name', 'Admin'),
  u.email,
  'admin',
  now()
from auth.users u
where u.email = 'jaylottiemukuka@gmail.com'
on conflict (id)
do update set
  name = excluded.name,
  email = excluded.email,
  role = 'admin',
  updated_at = now();
