-- Customizable CTA label for the "scopri tutto"-style links shown on the
-- home squares and on the /chi-sono section blocks.
alter table sections add column cta_label text not null default 'Scopri tutto';

-- Icon for the Vision home square (sections already have `icon`).
alter table site_settings add column vision_icon text;

-- Seed the "Valori" section + its 4 entries from the values already written
-- in site_settings.valori_body, so the home dropdown starts populated
-- instead of empty. Idempotent: safe to re-run.
do $$
declare
  v_section_id uuid;
begin
  insert into sections (slug, title, description, page_placement, is_published, sort_order)
  values (
    'valori',
    'Valori',
    'I 4 principi interni che guidano ogni mia decisione (secondo il modello dello psicologo Shalom Schwartz).',
    'standalone',
    true,
    (select coalesce(max(sort_order), 0) + 1 from sections)
  )
  on conflict (slug) do nothing
  returning id into v_section_id;

  if v_section_id is null then
    select id into v_section_id from sections where slug = 'valori';
  end if;

  insert into entries (section_id, slug, title, body, is_published, sort_order)
  values
    (
      v_section_id,
      'stimolazione',
      'Stimolazione',
      $val$<p>È la mia ricerca di novità, dinamismo e sfide, che mi spinge ad evitare la monotonia e a prediligere il cambiamento ed esperienze intense.</p><p>La curiosità, ovvero il desiderio di comprendere il mondo circostante, esplorare, fare domande e scoprire cose nuove con coraggio, amore per il rischio e spirito d'avventura è ciò che mi accompagna ogni giorno.</p>$val$,
      true,
      1
    ),
    (
      v_section_id,
      'universalismo',
      'Universalismo',
      $val$<p>È ciò che regola ogni parere che ho sulle cose. Metto da parte la soggettività (anche a mio discapito, a volte) a favore della giustizia e oggettività morale.</p><p><strong>I miei punti chiave:</strong></p><ul><li><p><strong>oggettività:</strong> i valori giusti non dipendono da ciò che una persona pensa o sente.</p></li><li><p><strong>imparzialità:</strong> le regole valgono nello stesso modo per tutti, anche quando questo va contro il proprio interesse personale.</p></li><li><p><strong>validità globale:</strong> esistono doveri e diritti che non cambiano mai, ovunque ci si trovi nel mondo.</p></li></ul>$val$,
      true,
      2
    ),
    (
      v_section_id,
      'autodirezione',
      'Autodirezione',
      $val$<p>È il mio forte bisogno di avere un pensiero e una capacità d'azione indipendenti, oltre che di esplorazione e creatività.</p><p><strong>È il mio valore più forte:</strong></p><ul><li><p><strong>libertà</strong>: poter agire e pensare in modo autonomo, rifiutando forme di controllo esterno o rigide correnti di pensiero.</p></li><li><p><strong>creatività</strong>: inventare cose nuove, avere idee originali ed esprimere il mio massimo potenziale intellettuale e artistico.</p></li><li><p><strong>scegliere i propri obiettivi</strong>: capacità e diritto di decidere la mia direzione di vita, indipendentemente dalle imposizioni o pressioni esterne e sociali.</p></li></ul>$val$,
      true,
      3
    ),
    (
      v_section_id,
      'realizzazione',
      'Realizzazione',
      $val$<p>Esprime la mia necessità di voler lasciare il segno.</p><p>Cosa significa la realizzazione per me:</p><ul><li><p><strong>ambizione:</strong> ho un forte desiderio di progredire, di pormi mete elevate e lavorare duramente per raggiungere i miei obiettivi.</p></li><li><p><strong>competenza:</strong> dimostrare a me stessa e agli altri, sviluppando capacità quotidianamente, di essere abile, efficiente ed efficace nello svolgimento dei miei compiti.</p></li><li><p><strong>influenza:</strong> avere un impatto significativo sulle persone e sul corso degli eventi ed essere riconosciuta per la mia personalità.</p></li></ul>$val$,
      true,
      4
    )
  on conflict (section_id, slug) do nothing;
end $$;
