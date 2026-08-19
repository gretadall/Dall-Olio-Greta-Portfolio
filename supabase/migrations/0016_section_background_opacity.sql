-- Lets each section's background image be dimmed so overlaid text stays
-- easy to read, independent of the image's own contrast.

alter table sections
  add column background_opacity integer not null default 100
    check (background_opacity >= 0 and background_opacity <= 100);
