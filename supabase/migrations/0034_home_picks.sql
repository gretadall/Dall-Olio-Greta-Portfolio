-- What the owner chose to feature on the home page, in her order:
--   { "projects": [entry ids], "moments": [entry_media ids], "timeline": [entry ids] }
-- An empty or missing list means "pick automatically", as before.

alter table site_settings
  add column home_picks jsonb not null default '{}'::jsonb;
