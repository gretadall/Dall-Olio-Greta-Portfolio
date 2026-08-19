-- Lets a connection be marked as valid in both directions, instead of
-- always being a one-way "from -> to" relationship.

alter table connections
  add column bidirectional boolean not null default false;
