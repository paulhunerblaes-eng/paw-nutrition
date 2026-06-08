-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Or via: supabase db push (if using Supabase CLI)

-- ─── Profiles ───────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id               uuid references auth.users on delete cascade primary key,
  email            text unique not null,
  stripe_customer_id text,
  is_subscribed    boolean default false,
  created_at       timestamptz default now()
);

-- ─── Animals ────────────────────────────────────────────────────────────────
create table if not exists public.animals (
  id                    uuid default gen_random_uuid() primary key,
  user_id               uuid references auth.users on delete cascade not null,
  nom                   text,
  type                  text,
  race                  text,
  taille                text,
  age                   text,
  poids                 text,
  sexe                  text,
  sterilise             boolean default false,
  niveau_activite       text,
  objectif              text,
  alimentation_actuelle text,
  budget                text,
  mode_vie              text,
  pathologies           text,
  allergies             text,
  evenements_recents    text,
  photo_url             text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- ─── Plans ──────────────────────────────────────────────────────────────────
create table if not exists public.plans (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users on delete cascade not null,
  animal_id   uuid references public.animals on delete cascade,
  contenu     jsonb,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─── Row-Level Security ──────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.animals  enable row level security;
alter table public.plans    enable row level security;

create policy "own_profile"
  on public.profiles for all
  using (auth.uid() = id);

create policy "own_animals"
  on public.animals for all
  using (auth.uid() = user_id);

create policy "own_plans"
  on public.plans for all
  using (auth.uid() = user_id);

-- ─── Auto-create profile on signup ──────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
