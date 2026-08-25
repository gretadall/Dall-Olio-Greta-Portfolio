import { notFound } from "next/navigation";
import {
  getSectionBySlug,
  getPublishedEntries,
  getPublishedTravelPins,
} from "@/lib/queries";
import { EntryCard } from "@/components/EntryCard";
import { SectionBackground } from "@/components/SectionBackground";
import { TravelGlobe } from "@/components/TravelGlobe";
import { EditableText } from "@/components/edit/EditableText";
import { buildGlobePins } from "@/lib/travel-pins";

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section: slug } = await params;
  const section = await getSectionBySlug(slug);

  if (!section) notFound();

  const isTravel = section.slug === "viaggi";

  const [entries, travelPinsRaw] = await Promise.all([
    getPublishedEntries(section.id),
    isTravel ? getPublishedTravelPins() : Promise.resolve([]),
  ]);

  const travelPins = buildGlobePins(travelPinsRaw);

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <SectionBackground
        imagePath={section.background_image_path}
        opacity={section.background_opacity}
      />
      <div className="flex items-center gap-2">
        {section.icon && <span className="text-2xl">{section.icon}</span>}
        <EditableText
          as="h1"
          className="text-3xl font-semibold tracking-tight"
          value={section.title}
          target={{ table: "sections", id: section.id, field: "title" }}
        />
      </div>
      <EditableText
        as="p"
        className="mt-3 max-w-2xl text-muted"
        value={section.description ?? ""}
        target={{ table: "sections", id: section.id, field: "description" }}
        multiline
      />

      {isTravel && (
        <div className="mt-10">
          <TravelGlobe pins={travelPins} />
          <p className="mt-4 text-center text-xs text-muted">
            Ogni bandierina è un luogo in cui sono stata: cliccala per
            scoprirlo. Quelle in evidenza hanno anche un racconto da leggere.
          </p>
        </div>
      )}

      {entries.length === 0 ? (
        <p className="mt-12 text-sm text-muted">
          Nessun contenuto pubblicato ancora in questa sezione.
        </p>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {entries.map((entry) => (
            <EntryCard key={entry.id} sectionSlug={section.slug} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
