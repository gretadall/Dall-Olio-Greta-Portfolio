-- Manual 3D positioning for /rete nodes, mirroring the old 2D graph_x/graph_y
-- (which stay as-is): once the owner drags a node on the 3D brain, its
-- position becomes fixed for every visitor. Null means "not yet placed",
-- falling back to the deterministic area-anchor + jitter placement.
alter table entries add column graph_z double precision;

-- Editable copy (label + short scientific note) for each of the six
-- brain-area zones on /rete, so the site owner can tweak the wording
-- inline without a deploy. Anchor positions/colors stay in code
-- (src/lib/brain-areas.ts); this table only holds the text shown to
-- visitors when they click a zone.
create table brain_areas (
  slug text primary key,
  label text not null,
  description text,
  updated_at timestamptz not null default now()
);

alter table brain_areas enable row level security;

create policy brain_areas_select_public on brain_areas
  for select using (true);

create policy brain_areas_write_owner on brain_areas
  for all using (is_owner()) with check (is_owner());

insert into brain_areas (slug, label, description) values
  (
    'prefrontal',
    'Corteccia prefrontale',
    'Governa la pianificazione, il ragionamento a lungo termine e le decisioni orientate a un obiettivo: la zona più plausibile per i valori che guidano le scelte.'
  ),
  (
    'linguistic',
    'Aree del linguaggio',
    'Le aree di Broca e Wernicke gestiscono produzione e comprensione del linguaggio; Broca è coinvolta anche nel decodificare le azioni altrui, un ponte plausibile con l''insegnare e allenare.'
  ),
  (
    'motor',
    'Area motoria & cervelletto',
    'Corteccia motoria e cervelletto coordinano il movimento volontario, l''equilibrio e l''apprendimento dei gesti: la sede naturale di sport e attività fisica.'
  ),
  (
    'limbic',
    'Sistema limbico',
    'Regola emozioni e motivazione, incluso l''impulso a cercare stimoli e situazioni nuove: coerente con la spinta emotiva che porta a viaggiare.'
  ),
  (
    'hippocampus',
    'Ippocampo',
    'Consolida i ricordi a lungo termine e supporta l''apprendimento: la sede naturale delle esperienze da cui si è imparato di più.'
  ),
  (
    'associative',
    'Corteccia associativa',
    'Integra informazioni provenienti da più aree per pianificare e costruire azioni complesse: coerente con progetti che uniscono competenze diverse.'
  );
