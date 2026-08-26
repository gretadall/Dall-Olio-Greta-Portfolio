-- Thematic brain-area placement for the /rete 3D visualization: each entry
-- can be pinned to one of six stylized brain regions. Null means "not yet
-- assigned", letting the scene fall back to a deterministic hash of the
-- entry id so it still renders somewhere stable.

alter table entries add column brain_area text;

alter table entries
  add constraint entries_brain_area_check
  check (brain_area in (
    'prefrontal', 'linguistic', 'motor', 'limbic', 'hippocampus', 'associative'
  ));

-- Best-effort seed for the current live entries, matched by title. If a
-- title has since changed this is a no-op for that row; fix it from the
-- entry's edit form instead of re-running this migration.

update entries set brain_area = 'prefrontal' where title in (
  'Stimolazione', 'Universalismo', 'Autodirezione', 'Realizzazione',
  'Judge di gare CrossFit'
);

update entries set brain_area = 'linguistic' where title in (
  'Scrittura', 'Intelligenza linguistica & neuroscienze',
  'Spagnolo', 'Francese', 'Inglese', 'Tedesco',
  'Co-coach di CrossFit', 'Tutoraggio studio'
);

update entries set brain_area = 'motor' where title in (
  'Bici & Hiking', 'CrossFit agonistico'
);

update entries set brain_area = 'limbic' where title in (
  'Viaggiare', 'Malta', 'Dublino', 'Scambio culturale ad Albertville'
);

update entries set brain_area = 'hippocampus' where title in (
  'Claude 101', 'From Zero To Startup', 'Relazioni internazionali per il Marketing'
);

update entries set brain_area = 'associative' where title in (
  'Libro "19"', 'Co-founder di YET', 'The First Athlete''s Journal',
  'Project Manager di "Prevento"', 'Hackathon a H-Farm'
);
