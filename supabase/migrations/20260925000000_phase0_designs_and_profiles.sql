-- PromoSuite Phase 0: profiles and saved designs
--
-- Safe to run more than once, and safe on databases created by the older
-- migrations in this folder. Run it in Supabase: SQL Editor -> New query -> paste -> Run.

-- ---------------------------------------------------------------------------
-- Profiles: one row per user, created automatically at sign-up
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists website text;
alter table public.profiles add column if not exists license_number text;
alter table public.profiles add column if not exists brokerage_name text;

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Sign-up trigger: only creates the profile. The older version also inserted a
-- subscription row, so sign-ups failed whenever the plans table was missing.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for accounts created while the trigger was missing or failing
insert into public.profiles (id, email, full_name)
select u.id, u.email, coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', split_part(u.email, '@', 1))
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Designs: documents saved from the Design Studio (Fabric.js JSON)
-- ---------------------------------------------------------------------------
create table if not exists public.designs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null default 'Untitled design',
  kind text not null default 'flyer',
  width integer,
  height integer,
  data jsonb not null,
  thumbnail text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists designs_user_updated_idx on public.designs (user_id, updated_at desc);

alter table public.designs enable row level security;

drop policy if exists "designs_select_own" on public.designs;
drop policy if exists "designs_insert_own" on public.designs;
drop policy if exists "designs_update_own" on public.designs;
drop policy if exists "designs_delete_own" on public.designs;
create policy "designs_select_own" on public.designs for select using (auth.uid() = user_id);
create policy "designs_insert_own" on public.designs for insert with check (auth.uid() = user_id);
create policy "designs_update_own" on public.designs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "designs_delete_own" on public.designs for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Storage: private per-user uploads (photos, logos), used from Phase 1.
-- Files live under <user id>/... and only that user can read or write them.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('user-uploads', 'user-uploads', false)
on conflict (id) do nothing;

drop policy if exists "user_uploads_select_own" on storage.objects;
drop policy if exists "user_uploads_insert_own" on storage.objects;
drop policy if exists "user_uploads_update_own" on storage.objects;
drop policy if exists "user_uploads_delete_own" on storage.objects;
create policy "user_uploads_select_own" on storage.objects for select
  using (bucket_id = 'user-uploads' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "user_uploads_insert_own" on storage.objects for insert
  with check (bucket_id = 'user-uploads' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "user_uploads_update_own" on storage.objects for update
  using (bucket_id = 'user-uploads' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "user_uploads_delete_own" on storage.objects for delete
  using (bucket_id = 'user-uploads' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------------------------------------------------------------------------
-- Security: remove the arbitrary-SQL helper the old app called from the
-- browser (any version of it), if an earlier session created one.
-- ---------------------------------------------------------------------------
do $$
declare
  fn record;
begin
  for fn in
    select p.oid::regprocedure as signature
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'execute_query'
  loop
    execute format('drop function %s', fn.signature);
  end loop;
end;
$$;
