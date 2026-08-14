-- Profile photo size/shape controls, an optional page background image, and
-- a customizable font color for primary body text.

alter table site_settings
  add column hero_photo_size integer not null default 96
    constraint site_settings_hero_photo_size_range check (hero_photo_size between 32 and 320),
  add column hero_photo_radius integer not null default 50
    constraint site_settings_hero_photo_radius_range check (hero_photo_radius between 0 and 50),
  add column background_image_path text,
  add column font_color text;
