-- Auto-provision a profile row for every new auth user
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Prevent a user from self-promoting to admin via a direct row update.
-- Only the service role (used from trusted server contexts) may flip is_admin.
create or replace function protect_is_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_admin is distinct from old.is_admin and auth.role() <> 'service_role' then
    new.is_admin := old.is_admin;
  end if;
  return new;
end;
$$;

create trigger trg_protect_is_admin
  before update on profiles
  for each row execute function protect_is_admin();
