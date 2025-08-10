-- Create profiles table without touching auth triggers
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Create or replace helper to update updated_at
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for updated_at
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

-- Policies
-- Anyone can read basic profile info (adjust later if needed)
create policy if not exists "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

-- Users can insert their own profile
create policy if not exists "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Users can update their own profile
create policy if not exists "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);
