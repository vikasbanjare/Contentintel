-- ContentIntel SaaS — run this in Supabase SQL editor (one click)

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  plan text not null default 'free',          -- free | starter | pro | agency
  checks_used int not null default 0,
  period_start timestamptz default now(),
  plan_renews_at timestamptz,
  last_call_at timestamptz,                    -- server-side rate limiting
  created_at timestamptz default now()
);
-- (safe to re-run: add the column if an older table already exists)
alter table public.profiles add column if not exists last_call_at timestamptz;

alter table public.profiles enable row level security;

-- Users can read their own profile (for the in-app usage bar)…
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles
  for select using (auth.uid() = id);

-- …and update ONLY their own row. plan/usage stay server-only.
drop policy if exists "update own name" on public.profiles;
create policy "update own name" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- SECURITY (defense in depth): column-level privilege so a user can ONLY change
-- full_name via the public anon key — never plan, checks_used, period_start, etc.
-- This is what actually blocks "PATCH checks_used = 0" quota-reset abuse.
revoke update on public.profiles from anon, authenticated;
grant  update (full_name) on public.profiles to authenticated;

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

-- Atomic, row-locked "reserve credits" — fixes the check-then-increment race AND
-- enforces a per-user rate limit in one shot. Returns: ok | over_limit | rate_limited | no_profile.
create or replace function public.try_consume_credits(uid uuid, amount int, lim int)
returns text language plpgsql security definer as $$
declare cur record;
begin
  select checks_used, last_call_at into cur from public.profiles where id = uid for update;
  if cur is null then return 'no_profile'; end if;
  if cur.last_call_at is not null and now() - cur.last_call_at < interval '1200 milliseconds' then
    return 'rate_limited';
  end if;
  if cur.checks_used + amount > lim then return 'over_limit'; end if;
  update public.profiles set checks_used = cur.checks_used + amount, last_call_at = now() where id = uid;
  return 'ok';
end $$;

-- Refund reserved credits if the downstream API call fails.
create or replace function public.refund_credits(uid uuid, amount int)
returns void language sql security definer as $$
  update public.profiles set checks_used = greatest(0, checks_used - amount) where id = uid;
$$;

-- (kept for backward compatibility; new code path uses try_consume_credits)
create or replace function public.increment_usage(uid uuid, amount int default 1)
returns void language sql security definer as $$
  update public.profiles set checks_used = checks_used + amount where id = uid;
$$;
