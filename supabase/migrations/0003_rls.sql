-- Row Level Security

alter table profiles enable row level security;
alter table sections enable row level security;
alter table entries enable row level security;
alter table entry_media enable row level security;
alter table likes enable row level security;
alter table comments enable row level security;
alter table follows enable row level security;

create or replace function is_owner()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false);
$$;

-- profiles
create policy profiles_select_all on profiles
  for select using (true);

create policy profiles_update_own on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- sections
create policy sections_select_public on sections
  for select using (is_published);

create policy sections_select_owner on sections
  for select using (is_owner());

create policy sections_write_owner on sections
  for all using (is_owner()) with check (is_owner());

-- entries
create policy entries_select_public on entries
  for select using (
    is_published and exists (
      select 1 from sections s where s.id = entries.section_id and s.is_published
    )
  );

create policy entries_select_owner on entries
  for select using (is_owner());

create policy entries_write_owner on entries
  for all using (is_owner()) with check (is_owner());

-- entry_media
create policy entry_media_select_public on entry_media
  for select using (
    is_owner() or exists (
      select 1 from entries e join sections s on s.id = e.section_id
      where e.id = entry_media.entry_id and e.is_published and s.is_published
    )
  );

create policy entry_media_write_owner on entry_media
  for all using (is_owner()) with check (is_owner());

-- likes
create policy likes_select_all on likes
  for select using (true);

create policy likes_insert_own on likes
  for insert to authenticated with check (auth.uid() = user_id);

create policy likes_delete_own on likes
  for delete to authenticated using (auth.uid() = user_id);

-- comments
create policy comments_select_public on comments
  for select using (not is_hidden or is_owner());

create policy comments_insert_own on comments
  for insert to authenticated with check (auth.uid() = user_id and not is_hidden);

create policy comments_delete_own_or_owner on comments
  for delete using (auth.uid() = user_id or is_owner());

create policy comments_update_owner on comments
  for update using (is_owner()) with check (is_owner());

-- follows
create policy follows_select_own_or_owner on follows
  for select using (auth.uid() = user_id or is_owner());

create policy follows_insert_own on follows
  for insert to authenticated with check (auth.uid() = user_id);

create policy follows_delete_own on follows
  for delete to authenticated using (auth.uid() = user_id);
