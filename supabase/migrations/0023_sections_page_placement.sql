-- Lets a section opt into the /chi-sono aggregate scroll list (the
-- SectionBlock/SectionDotNav/Reveal pipeline moved off Home), while staying
-- a fully valid standalone page at /[section] either way.

alter table sections
  add column page_placement text not null default 'standalone';

alter table sections
  add constraint sections_page_placement_check
  check (page_placement in ('standalone', 'chi_sono'));
