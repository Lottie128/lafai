-- Supabase schema for La'Fai
-- Run in Supabase SQL editor (project database)

-- Extensions
create extension if not exists "pgcrypto";

-- Profiles table (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  phone text,
  address text,
  city text,
  role text not null default 'user' check (role in ('user', 'admin')),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_updated_at_idx on public.profiles (updated_at desc);

-- Orders table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid references public.profiles(id) on delete set null,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric not null default 0,
  total numeric not null default 0,
  currency text not null default 'ZMW',
  status text not null default 'Processing',
  payment_method text,
  payment_ref text,
  shipping jsonb not null default '{}'::jsonb
);

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

-- Settings table (admin-only access via service role)
create table if not exists public.site_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.site_settings enable row level security;

-- Profiles policies
-- Users can read their own profile
create policy "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = id);

-- Users can insert their own profile, role forced to 'user'
create policy "profiles_insert_own"
  on public.profiles
  for insert
  with check (auth.uid() = id and role = 'user');

-- Users can update their own profile but cannot change role
create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select role from public.profiles where id = auth.uid())
  );

-- Orders policies
-- Authenticated users can create orders for themselves
create policy "orders_insert_own"
  on public.orders
  for insert
  with check (auth.uid() = user_id);

-- Authenticated users can read their own orders
create policy "orders_select_own"
  on public.orders
  for select
  using (auth.uid() = user_id);

-- No policies for site_settings (service role only)
