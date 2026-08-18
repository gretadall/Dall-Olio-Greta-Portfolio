-- Lets the owner control splash screen duration, header button labels, and
-- the footer credit line from the admin settings panel instead of code.

alter table site_settings
  add column splash_duration_seconds numeric not null default 3,
  add column nav_home_label text not null default 'Chi sono',
  add column nav_rete_label text not null default 'Rete',
  add column linkedin_label text not null default 'LinkedIn',
  add column contact_button_label text not null default 'Scrivimi',
  add column footer_text text not null default 'Built by Greta dall''Olio';
