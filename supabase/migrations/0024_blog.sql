-- Blog: dedicated tables (not the generic sections/entries) so posts can
-- carry category badges/colors, excerpts, publish dates, and support
-- numbered pagination with a total-count footer.

create table blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  color text not null default '#888888',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references blog_categories(id) on delete set null,
  slug text not null unique,
  title text not null,
  excerpt text,
  body text,
  cover_image_path text,
  is_published boolean not null default true,
  published_at timestamptz,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index blog_posts_published_idx
  on blog_posts (is_published, published_at desc);

alter table blog_categories enable row level security;
alter table blog_posts enable row level security;

-- categories are just labels/metadata, always publicly readable
create policy blog_categories_select_public on blog_categories
  for select using (true);

create policy blog_categories_write_owner on blog_categories
  for all using (is_owner()) with check (is_owner());

create policy blog_posts_select_public on blog_posts
  for select using (is_published);

create policy blog_posts_select_owner on blog_posts
  for select using (is_owner());

create policy blog_posts_write_owner on blog_posts
  for all using (is_owner()) with check (is_owner());
