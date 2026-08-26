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
  const hasBackground = Boolean(section.background_image_path);

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
        darkness={section.home_overlay_darkness}
      />
      <div className="flex items-center gap-2">
        {section.icon && <span className="text-2xl">{section.icon}</span>}
        <EditableText
          as="h1"
          className={`text-3xl font-semibold tracking-tight ${hasBackground ? "text-white" : ""}`}
          value={section.title}
          target={{ table: "sections", id: section.id, field: "title" }}
        />
      </div>
      <EditableText
        as="p"
        className={`mt-3 max-w-2xl ${hasBackground ? "text-white/75" : "text-muted"}`}
        value={section.description ?? ""}
        target={{ table: "sections", id: section.id, field: "description" }}
        multiline
      />

      {isTravel && (
        <div className="mt-10">
          <TravelGlobe pins={travelPins} />
          <p className={`mt-4 text-center text-xs ${hasBackground ? "text-white/75" : "text-muted"}`}>
            Ogni bandierina è un luogo in cui sono stata: cliccala per
            scoprirlo. Quelle in evidenza hanno anche un racconto da leggere.
          </p>
        </div>
      )}

      {entries.length === 0 ? (
        <p className={`mt-12 text-sm ${hasBackground ? "text-white/75" : "text-muted"}`}>
          Nessun contenuto pubblicato ancora in questa sezione.
        </p>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {entries.map((entry) => (
            <EntryCard
              key={entry.id}
              sectionSlug={section.slug}
              entry={entry}
              hasBackground={hasBackground}
            />
          ))}
        </div>
      )}
    </div>
  );
}
