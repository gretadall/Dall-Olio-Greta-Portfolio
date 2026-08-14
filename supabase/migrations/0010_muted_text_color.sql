-- Lets the owner recolor the secondary/muted text used across descriptions,
-- taglines, and metadata, which previously only came in a fixed gray.

alter table site_settings
  add column muted_color text;
