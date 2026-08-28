-- Editable copy for the static text on /blog (page title, empty-state
-- message), so the owner can tweak wording inline like the rest of the
-- site's admin-managed text.

alter table site_settings
  add column blog_title text not null default 'Blog',
  add column blog_empty_text text default 'Nessun articolo pubblicato ancora.';
