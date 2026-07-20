-- Re-point user_id foreign keys at public.profiles instead of auth.users.
-- profiles.id is itself a 1:1 FK to auth.users(id) (see 0001_init.sql), so this
-- preserves the same referential guarantee while letting PostgREST embed
-- profile data directly in queries like `comments.select('*, profiles(...)')`.

alter table likes drop constraint likes_user_id_fkey;
alter table likes add constraint likes_user_id_fkey
  foreign key (user_id) references profiles(id) on delete cascade;

alter table comments drop constraint comments_user_id_fkey;
alter table comments add constraint comments_user_id_fkey
  foreign key (user_id) references profiles(id) on delete cascade;

alter table follows drop constraint follows_user_id_fkey;
alter table follows add constraint follows_user_id_fkey
  foreign key (user_id) references profiles(id) on delete cascade;
