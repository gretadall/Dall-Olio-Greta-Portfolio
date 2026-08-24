import { notFound } from "next/navigation";
import {
  getSectionBySlug,
  getPublishedEntries,
  getPublishedTravelPins,
} from "@/lib/queries";
import { EntryCard } from "@/components/EntryCard";
import { SectionBackground } from "@/components/SectionBackground";
import { TravelGlobe, type GlobePin } from "@/components/TravelGlobe";

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

  const travelPins: GlobePin[] = travelPinsRaw.map((pin) => {
    const entry = Array.isArray(pin.entries) ? pin.entries[0] : pin.entries;
    const entrySections = entry
      ? Array.isArray(entry.sections)
        ? entry.sections[0]
        : entry.sections
      : null;
    return {
      id: pin.id,
      label: pin.label,
      country: pin.country,
      lat: pin.lat,
      lng: pin.lng,
      href:
        entry && entrySections
          ? `/${entrySections.slug}/${entry.slug}`
          : null,
    };
  });

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <SectionBackground
        imagePath={section.background_image_path}
        opacity={section.background_opacity}
      />
      <div className="flex items-center gap-2">
        {section.icon && <span className="text-2xl">{section.icon}</span>}
        <h1 className="text-3xl font-semibold tracking-tight">
          {section.title}
        </h1>
      </div>
      {section.description && (
        <p className="mt-3 max-w-2xl text-muted">
          {section.description}
        </p>
      )}

      {isTravel && (
        <div className="mt-10">
          <TravelGlobe pins={travelPins} />
          <p className="mt-4 text-center text-xs text-muted">
            Ogni bandierina è un luogo in cui sono stata. Quelle in
            evidenza raccontano anche una storia — cliccale per leggerla.
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
