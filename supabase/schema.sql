-- invoice-gen.net database
-- Run this once in Supabase → SQL Editor → New query → paste → Run.
-- Every table has Row Level Security, so each user can only see their own rows.

-- Business profile (one row per user)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Saved clients
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 200),
  email text,
  phone text,
  address text,
  created_at timestamptz not null default now()
);
create index if not exists clients_user_idx on public.clients (user_id);

-- Invoices (full invoice kept in "data", key fields copied out for the dashboard)
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  number text not null,
  client_name text,
  client_email text,
  issue_date date,
  due_date date,
  currency text not null default 'USD',
  total numeric(14, 2) not null default 0,
  balance numeric(14, 2) not null default 0,
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue')),
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists invoices_user_idx on public.invoices (user_id, created_at desc);

-- Log of emailed invoices (used for the daily sending limit)
create table if not exists public.email_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  invoice_id uuid references public.invoices (id) on delete set null,
  to_email text not null,
  sent_at timestamptz not null default now()
);
create index if not exists email_log_user_idx on public.email_log (user_id, sent_at desc);

-- keep updated_at fresh
create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists invoices_touch on public.invoices;
create trigger invoices_touch before update on public.invoices
  for each row execute function public.touch_updated_at();

-- Row Level Security
alter table public.profiles  enable row level security;
alter table public.clients   enable row level security;
alter table public.invoices  enable row level security;
alter table public.email_log enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "own clients" on public.clients;
create policy "own clients" on public.clients
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "own invoices" on public.invoices;
create policy "own invoices" on public.invoices
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- email_log: users can read and add their own rows, but not edit or delete them
-- (so the daily limit can't be reset from the browser)
drop policy if exists "read own email log" on public.email_log;
create policy "read own email log" on public.email_log
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "insert own email log" on public.email_log;
create policy "insert own email log" on public.email_log
  for insert to authenticated with check ((select auth.uid()) = user_id);
