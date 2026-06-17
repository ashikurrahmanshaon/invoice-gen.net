-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES TABLE
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  company_name text,
  company_email text,
  company_phone text,
  company_address text,
  logo_url text,
  currency text default 'USD',
  is_premium boolean default false,
  stripe_customer_id text,
  stripe_subscription_id text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CLIENTS TABLE
create table public.clients (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  email text,
  phone text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- INVOICES TABLE
create table public.invoices (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete set null,
  invoice_number text not null,
  status text not null check (status in ('draft', 'pending', 'paid', 'overdue')),
  issue_date date not null,
  due_date date not null,
  currency text default 'USD' not null,
  tax_rate numeric default 0 not null,
  tax_amount numeric default 0 not null,
  discount_rate numeric default 0 not null,
  discount_amount numeric default 0 not null,
  subtotal numeric default 0 not null,
  total numeric default 0 not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- INVOICE ITEMS TABLE
create table public.invoice_items (
  id uuid default uuid_generate_v4() primary key,
  invoice_id uuid references public.invoices(id) on delete cascade not null,
  description text not null,
  quantity numeric default 1 not null,
  unit_price numeric default 0 not null,
  amount numeric default 0 not null
);

-- PAYMENTS TABLE (Premium Feature)
create table public.payments (
  id uuid default uuid_generate_v4() primary key,
  invoice_id uuid references public.invoices(id) on delete cascade not null,
  amount numeric not null,
  payment_date timestamp with time zone default timezone('utc'::text, now()) not null,
  payment_method text not null,
  notes text
);

-- Row Level Security (RLS) Configuration

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;

-- Policies for Profiles
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Policies for Clients
create policy "Users can view their own clients" on public.clients
  for select using (auth.uid() = user_id);

create policy "Users can insert their own clients" on public.clients
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own clients" on public.clients
  for update using (auth.uid() = user_id);

create policy "Users can delete their own clients" on public.clients
  for delete using (auth.uid() = user_id);

-- Policies for Invoices
create policy "Users can view their own invoices" on public.invoices
  for select using (auth.uid() = user_id);

create policy "Users can insert their own invoices" on public.invoices
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own invoices" on public.invoices
  for update using (auth.uid() = user_id);

create policy "Users can delete their own invoices" on public.invoices
  for delete using (auth.uid() = user_id);

-- Policies for Invoice Items (nested policy matching owner invoice user_id)
create policy "Users can view items of their own invoices" on public.invoice_items
  for select using (
    exists (
      select 1 from public.invoices
      where public.invoices.id = public.invoice_items.invoice_id
      and public.invoices.user_id = auth.uid()
    )
  );

create policy "Users can insert items to their own invoices" on public.invoice_items
  for insert with check (
    exists (
      select 1 from public.invoices
      where public.invoices.id = invoice_items.invoice_id
      and public.invoices.user_id = auth.uid()
    )
  );

create policy "Users can update items of their own invoices" on public.invoice_items
  for update using (
    exists (
      select 1 from public.invoices
      where public.invoices.id = public.invoice_items.invoice_id
      and public.invoices.user_id = auth.uid()
    )
  );

create policy "Users can delete items of their own invoices" on public.invoice_items
  for delete using (
    exists (
      select 1 from public.invoices
      where public.invoices.id = public.invoice_items.invoice_id
      and public.invoices.user_id = auth.uid()
    )
  );

-- Policies for Payments
create policy "Users can view payments of their own invoices" on public.payments
  for select using (
    exists (
      select 1 from public.invoices
      where public.invoices.id = public.payments.invoice_id
      and public.invoices.user_id = auth.uid()
    )
  );

create policy "Users can insert payments to their own invoices" on public.payments
  for insert with check (
    exists (
      select 1 from public.invoices
      where public.invoices.id = payments.invoice_id
      and public.invoices.user_id = auth.uid()
    )
  );

-- Profile creation trigger on auth sign up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, company_name, company_email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'company_name', 'My Company'),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
