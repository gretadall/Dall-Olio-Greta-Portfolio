-- Sample content for local/dev testing. Safe to re-run (upserts by slug).

insert into sections (slug, title, description, icon, sort_order)
values
  ('esperienze', 'Esperienze', 'Percorso professionale e progetti significativi.', '💼', 1),
  ('viaggi', 'Viaggi', 'I luoghi che mi hanno cambiata.', '✈️', 2),
  ('valori', 'Valori personali', 'Cosa guida le mie decisioni.', '🧭', 3)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  icon = excluded.icon,
  sort_order = excluded.sort_order;

insert into entries (section_id, slug, title, description, body, period_start, period_end, location, sort_order)
select s.id, v.slug, v.title, v.description, v.body, v.period_start::date, v.period_end::date, v.location, v.sort_order
from sections s
join (values
  ('esperienze', 'growth-lead', 'Growth Lead', 'Guida della crescita prodotto per un team di 8 persone.', 'Ho impostato il processo di sperimentazione, portando il tasso di attivazione dal 12% al 27% in un anno.', '2023-01-01', null, 'Milano', 1),
  ('viaggi', 'islanda', 'Islanda in solitaria', 'Tre settimane on the road tra ghiacciai e vulcani.', 'Il viaggio che mi ha insegnato a stare bene nell''incertezza.', '2022-06-01', '2022-06-21', 'Islanda', 1),
  ('valori', 'autenticita', 'Autenticità', 'Preferisco una verità scomoda a un consenso di comodo.', null, null, null, null, 1)
) as v(section_slug, slug, title, description, body, period_start, period_end, location, sort_order)
  on v.section_slug = s.slug
on conflict (section_id, slug) do update set
  title = excluded.title,
  description = excluded.description,
  body = excluded.body,
  period_start = excluded.period_start,
  period_end = excluded.period_end,
  location = excluded.location,
  sort_order = excluded.sort_order;
