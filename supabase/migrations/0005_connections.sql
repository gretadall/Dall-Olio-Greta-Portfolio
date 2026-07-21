-- Labeled, directional connections between entries (e.g. "Maratona di New York"
-- —ha rafforzato→ "Resilienza"), so experiences can show how they shaped traits/values.

create table connections (
  id uuid primary key default gen_random_uuid(),
  from_entry_id uuid not null references entries(id) on delete cascade,
  to_entry_id uuid not null references entries(id) on delete cascade,
  label text not null,
  created_at timestamptz not null default now(),
  check (from_entry_id <> to_entry_id),
  unique (from_entry_id, to_entry_id, label)
);

create index connections_from_idx on connections(from_entry_id);
create index connections_to_idx on connections(to_entry_id);

alter table connections enable row level security;

create policy connections_select_public on connections
  for select using (
    is_owner() or (
      exists (
        select 1 from entries e join sections s on s.id = e.section_id
        where e.id = connections.from_entry_id and e.is_published and s.is_published
      )
      and exists (
        select 1 from entries e join sections s on s.id = e.section_id
        where e.id = connections.to_entry_id and e.is_published and s.is_published
      )
    )
  );

create policy connections_write_owner on connections
  for all using (is_owner()) with check (is_owner());
