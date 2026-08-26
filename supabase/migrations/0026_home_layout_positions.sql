-- Per-slot visual nudge positions for the home page squares. Keyed by an
-- arbitrary slot name (e.g. "vision.heading"), value {x, y} as a percentage
-- offset from the element's normal flow position. Empty object means every
-- slot is still in its default (unmoved) position.

alter table site_settings add column home_layout jsonb not null default '{}'::jsonb;
alter table sections add column home_layout jsonb not null default '{}'::jsonb;
