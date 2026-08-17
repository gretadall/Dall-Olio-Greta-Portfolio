-- Lets each section have its own background image, overriding the site-wide
-- background while browsing that section and its entries.

alter table sections
  add column background_image_path text;
