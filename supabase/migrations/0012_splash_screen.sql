-- Adds an optional splash/intro screen shown for a few seconds when the site
-- first loads, to build a bit of suspense before revealing the content.

alter table site_settings
  add column splash_enabled boolean not null default false,
  add column splash_image_path text,
  add column splash_title text,
  add column splash_message text;
