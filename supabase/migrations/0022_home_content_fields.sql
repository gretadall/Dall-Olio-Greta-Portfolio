-- Home redesign: Vision / Valori / Formazione content blocks, plus nav label
-- rename ("Chi sono" -> "Home") and two new top-level nav labels for the
-- new /chi-sono and /blog routes.

alter table site_settings
  add column vision_text text,
  add column valori_intro text,
  add column valori_body text,
  add column formazione_intro text,
  add column formazione_body text,
  add column nav_chi_sono_label text not null default 'Chi sono',
  add column nav_blog_label text not null default 'Blog';

-- The Home hero used to be labelled "Chi sono"; that name now belongs to the
-- new dedicated About page. Only rename the value if it still matches the
-- pre-existing default, so a previously-customized label is left untouched.
update site_settings
  set nav_home_label = 'Home'
  where nav_home_label = 'Chi sono';

alter table site_settings
  alter column nav_home_label set default 'Home';
