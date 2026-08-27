-- Adjustable intensity (0-100) for the soft white halo behind the nav logo.
alter table site_settings add column logo_glow_intensity integer not null default 25;
