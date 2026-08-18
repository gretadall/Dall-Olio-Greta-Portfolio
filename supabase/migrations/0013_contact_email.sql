-- Adds a contact email used by the "write to me" button in the header.

alter table site_settings
  add column contact_email text;

update site_settings set contact_email = 'greta.dal19@gmail.com' where id = true;
