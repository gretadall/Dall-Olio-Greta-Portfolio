import {
  getSiteSettings,
  getPublishedSections,
  getPublishedEntriesForSections,
  getPersonalPhotos,
} from "@/lib/queries";
import { getMediaUrl } from "@/lib/supabase/media";
import { formatPeriod } from "@/lib/format-date";
import { parseHomePicks } from "@/lib/home-picks";
import { HomePicker, type PickOption } from "@/components/admin/HomePicker";

export default async function AdminHomePage() {
  const [settings, sections, photos] = await Promise.all([
    getSiteSettings(),
    getPublishedSections(),
    getPersonalPhotos({ everyImage: true }),
  ]);
  const entries = await getPublishedEntriesForSections(sections.map((s) => s.id));
  const picks = parseHomePicks(settings.home_picks);
  const sectionOf = (id: string) => sections.find((s) => s.id === id);
  const coverOf = (entryId: string) => photos.find((p) => p.entryId === entryId)?.path;

  const entryOption = (entry: (typeof entries)[number]): PickOption => {
    const cover = coverOf(entry.id);
    return {
      id: entry.id,
      title: entry.title,
      subtitle: [sectionOf(entry.section_id)?.title, formatPeriod(entry.period_start, entry.period_end)]
        .filter(Boolean)
        .join(" · "),
      imageUrl: cover ? getMediaUrl(cover) : undefined,
    };
  };

  // "Cose che ho costruito": projects first, experiences too.
  const buildSections = ["progetti-personali", "esperienze"];
  const projectOptions = buildSections.flatMap((slug) => {
    const section = sections.find((s) => s.slug === slug);
    return section ? entries.filter((e) => e.section_id === section.id).map(entryOption) : [];
  });

  const momentOptions: PickOption[] = photos.map((photo) => ({
    id: photo.id,
    title: photo.title,
    subtitle: photo.alt !== photo.title ? photo.alt : undefined,
    imageUrl: getMediaUrl(photo.path),
  }));

  // Only dated entries can sit on the timeline.
  const timelineOptions = entries
    .filter((e) => e.period_start)
    .sort((a, b) => (b.period_start ?? "").localeCompare(a.period_start ?? ""))
    .map(entryOption);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-4xl">Home</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Scegli tu cosa mettere in evidenza nella home. Finché un elenco è vuoto, il sito sceglie in
          automatico. Le foto e i contenuti si aggiungono da Sezioni.
        </p>
      </div>

      <HomePicker
        kind="projects"
        title="Cose che ho costruito"
        description="I progetti mostrati come card in home, nell'ordine che scegli. Ne stanno bene 3 (o 6)."
        options={projectOptions}
        initial={picks.projects}
      />

      <HomePicker
        kind="moments"
        title="Qualche momento"
        description="Le foto della galleria che scorre, nell'ordine che scegli. Le prime due finiscono anche come polaroid accanto alla tua foto in apertura."
        options={momentOptions}
        initial={picks.moments}
      />

      <HomePicker
        kind="timeline"
        title="La strada fin qui"
        description="Le tappe del percorso. Vengono sempre mostrate in ordine di data, dalla più vecchia a oggi."
        options={timelineOptions}
        initial={picks.timeline}
        ordered={false}
      />
    </div>
  );
}
