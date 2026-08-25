-- Controls how dark the halo behind the text is, when a section's background
-- photo is shown on the homepage scroll.
alter table sections add column home_overlay_darkness int not null default 55;
