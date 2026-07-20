-- Core schema: profiles, sections, entries, entry_media, likes, comments, follows

create extension if not exists "pgcrypto";

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  avatar_url text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table sections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  icon text,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table entries (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references sections(id) on delete cascade,
  slug text not null,
  title text not null,
  description text,
  body text,
  period_start date,
  period_end date,
  location text,
  metadata jsonb not null default '{}'::jsonb,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (section_id, slug)
);

create table entry_media (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references entries(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table likes (
  entry_id uuid not null references entries(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (entry_id, user_id)
);

create table comments (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references entries(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create table follows (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index entries_section_sort_idx on entries (section_id, sort_order);
create index likes_entry_idx on likes (entry_id);
create index comments_entry_idx on comments (entry_id);
