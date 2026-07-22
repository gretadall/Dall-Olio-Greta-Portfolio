-- Manually-arranged, persistent graph layout: once the owner drags a node,
-- its position becomes fixed for every visitor. Nulls mean "not yet placed",
-- letting the force simulation position new/unarranged entries automatically.

alter table entries add column graph_x double precision;
alter table entries add column graph_y double precision;

-- Per-section color for the graph, replacing the automatic palette when set.
alter table sections add column color text
  constraint sections_color_hex check (color is null or color ~ '^#[0-9a-fA-F]{6}$');
