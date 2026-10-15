-- Every fixed piece of wording in the public interface (titles, buttons,
-- labels, hints) as an editable override, keyed by a stable id such as
-- "home.hero.cta". Missing keys fall back to the defaults in
-- src/lib/ui-texts.ts, so this starts empty.

alter table site_settings
  add column ui_texts jsonb not null default '{}'::jsonb;
