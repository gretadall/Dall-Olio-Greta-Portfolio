-- Editable copy for the static text on /rete (title, intro, interaction
-- hint, small caption, artistic-interpretation disclaimer), so the owner
-- can tweak wording inline like the rest of the site's admin-managed text.

alter table site_settings add column rete_title text;
alter table site_settings add column rete_intro text;
alter table site_settings add column rete_hint text;
alter table site_settings add column rete_note text;
alter table site_settings add column rete_disclaimer text;

update site_settings set
  rete_title = 'Rete di connessioni',
  rete_intro = 'Come le esperienze si intrecciano e contribuiscono a formare chi sono.',
  rete_hint = 'Il cervello ruota da solo — trascinalo per girarlo come vuoi. Clicca su un punto per vedere i suoi collegamenti, o su una zona colorata per scoprire a cosa corrisponde.',
  rete_note = 'Clicca una zona colorata per scoprire a cosa corrisponde.',
  rete_disclaimer = 'Le aree cerebrali sono un''interpretazione artistica, non un modello scientifico.'
where id = true;
