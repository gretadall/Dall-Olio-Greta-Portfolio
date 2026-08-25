-- A background photo (with adjustable dark halo) for the hero ("Chi sono") block on the homepage.
alter table site_settings add column hero_background_image_path text;
alter table site_settings add column hero_overlay_darkness int not null default 55;
