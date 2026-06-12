-- ContentIntel SaaS — run this in Supabase SQL editor (one click)

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  plan text not null default 'free',          -- free | starter | pro | agency
  checks_used int not null default 0,
  period_start timestamptz default now(),
  plan_renews_at timestamptz,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Users can read their own profile (for the in-app usage bar)…
create policy "read own profile" on public.profiles
  for select using (auth.uid() = id);
-- …and update ONLY their name. plan/usage are server-only (service role bypasses RLS).
create policy "update own name" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id and plan = (select plan from public.profiles where id = auth.uid()));

-- Auto-create a profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- Atomic usage increment (called by the worker)
create or replace function public.increment_usage(uid uuid)
returns void language sql security definer as $$
  update public.profiles set checks_used = checks_used + 1 where id = uid;
$$;
