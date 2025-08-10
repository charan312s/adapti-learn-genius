-- Ensure profiles table and policies exist and are correct
-- 1) Table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Enable RLS
alter table public.profiles enable row level security;

-- 3) Timestamp trigger function (idempotent)
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 4) Trigger for updated_at (idempotent)
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

-- 5) Policies - drop and recreate to avoid duplicates
-- SELECT policy
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

-- INSERT policy
drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- UPDATE policy
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);
