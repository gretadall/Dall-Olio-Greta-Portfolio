-- Singleton table for site-wide branding/theming, editable from /admin/settings.
-- The boolean PK + check trick guarantees exactly one row can ever exist.

create table site_settings (
  id boolean primary key default true,
  site_title text not null default 'Beyond CV',
  tagline text,
  owner_name text,
  hero_photo_path text,
  primary_color text not null default '#f97316',
  accent_color text not null default '#3b82f6',
  font_choice text not null default 'geist',
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id),
  constraint site_settings_font_choice check (
    font_choice in ('geist', 'inter', 'playfair', 'space-mono')
  )
);

insert into site_settings (id) values (true);

alter table site_settings enable row level security;

create policy site_settings_select_public on site_settings
  for select using (true);

create policy site_settings_write_owner on site_settings
  for all using (is_owner()) with check (is_owner());

-- Storage bucket for hero photo + entry media, public read / owner-only write.

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy media_public_read on storage.objects
  for select using (bucket_id = 'media');

create policy media_owner_insert on storage.objects
  for insert with check (bucket_id = 'media' and is_owner());

create policy media_owner_update on storage.objects
  for update using (bucket_id = 'media' and is_owner());

create policy media_owner_delete on storage.objects
  for delete using (bucket_id = 'media' and is_owner());
