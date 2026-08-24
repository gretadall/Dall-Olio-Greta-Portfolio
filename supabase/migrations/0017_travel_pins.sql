-- Pins for the "Viaggi" globe: every visited place gets a marker,
-- only some are linked to a full entry with a description.

create table travel_pins (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  country text,
  lat double precision not null,
  lng double precision not null,
  entry_id uuid references entries(id) on delete set null,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index travel_pins_sort_idx on travel_pins (sort_order);

alter table travel_pins enable row level security;

create policy travel_pins_select_public on travel_pins
  for select using (is_published);

create policy travel_pins_select_owner on travel_pins
  for select using (is_owner());

create policy travel_pins_write_owner on travel_pins
  for all using (is_owner()) with check (is_owner());
