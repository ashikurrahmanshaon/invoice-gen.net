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
create index if not exists email_log_invoice_idx on public.email_log (invoice_id);

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

-- live dashboard: send invoice changes to the open dashboard (run once; safe to repeat)
do $$ begin
  alter publication supabase_realtime add table public.invoices;
exception when duplicate_object then null;
end $$;

-- Account info, kept apart from "data" (which holds the business details for invoices)
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists provider text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists last_sign_in timestamptz;

-- Save every new account automatically (email, Google name and photo, sign-in method)
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, provider, created_at, last_sign_in)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_app_meta_data->>'provider', 'email'),
    new.created_at, new.last_sign_in_at
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    provider = excluded.provider,
    last_sign_in = excluded.last_sign_in;
  return new;
end $$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- keep the email and last sign-in time up to date
drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated after update of email, last_sign_in_at, raw_user_meta_data on auth.users
  for each row execute function public.handle_new_user();

-- add profiles for accounts that already exist
insert into public.profiles (id, email, full_name, avatar_url, provider, created_at, last_sign_in)
select u.id, u.email,
  coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'),
  u.raw_user_meta_data->>'avatar_url',
  coalesce(u.raw_app_meta_data->>'provider', 'email'),
  u.created_at, u.last_sign_in_at
from auth.users u
on conflict (id) do nothing;

-- History: every saved version of an invoice is kept, also after it is deleted (a backup inside the database).
-- Users can read their own history; only the database itself writes to it.
create table if not exists public.invoice_history (
  id bigint generated always as identity primary key,
  invoice_id uuid not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  action text not null check (action in ('created', 'updated', 'deleted')),
  number text,
  status text,
  total numeric(14, 2),
  data jsonb,
  changed_at timestamptz not null default now()
);
create index if not exists invoice_history_user_idx on public.invoice_history (user_id, changed_at desc);
create index if not exists invoice_history_invoice_idx on public.invoice_history (invoice_id, changed_at desc);
alter table public.invoice_history enable row level security;
drop policy if exists "read own history" on public.invoice_history;
create policy "read own history" on public.invoice_history for select to authenticated using ((select auth.uid()) = user_id);

create or replace function public.log_invoice_change() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    insert into public.invoice_history (invoice_id, user_id, action, number, status, total, data)
    values (new.id, new.user_id, 'created', new.number, new.status, new.total, new.data);
    return new;
  elsif tg_op = 'UPDATE' then
    -- autosave runs often: keep at most one version per invoice every 2 minutes, plus every status change
    if new.status is distinct from old.status or not exists (
      select 1 from public.invoice_history h
      where h.invoice_id = new.id and h.changed_at > now() - interval '2 minutes' and h.action <> 'deleted') then
      insert into public.invoice_history (invoice_id, user_id, action, number, status, total, data)
      values (new.id, new.user_id, 'updated', new.number, new.status, new.total, new.data);
    else
      update public.invoice_history set number = new.number, status = new.status, total = new.total, data = new.data
      where id = (select h.id from public.invoice_history h where h.invoice_id = new.id order by h.changed_at desc limit 1);
    end if;
    return new;
  else
    insert into public.invoice_history (invoice_id, user_id, action, number, status, total, data)
    values (old.id, old.user_id, 'deleted', old.number, old.status, old.total, old.data);
    return old;
  end if;
end $$;
revoke execute on function public.log_invoice_change() from public, anon, authenticated;
drop trigger if exists invoices_history on public.invoices;
create trigger invoices_history after insert or update or delete on public.invoices
  for each row execute function public.log_invoice_change();
