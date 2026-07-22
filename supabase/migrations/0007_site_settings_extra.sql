-- Additional branding controls: page background color and a LinkedIn link
-- for the persistent header button.

alter table site_settings
  add column background_color text,
  add column linkedin_url text;
