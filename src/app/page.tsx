import Image from "next/image";
import {
  getPublishedSections,
  getSiteSettings,
  getPublishedEntries,
  getPublishedTravelPins,
} from "@/lib/queries";
import { getMediaUrl } from "@/lib/supabase/media";
import { SectionBlock } from "@/components/home/SectionBlock";
import { SectionDotNav } from "@/components/home/SectionDotNav";
import type { GlobePin } from "@/components/TravelGlobe";

export default async function Home() {
  const [sections, settings] = await Promise.all([
    getPublishedSections(),
    getSiteSettings(),
  ]);

  const hasTravelSection = sections.some((s) => s.slug === "viaggi");

  const [entriesBySection, travelPinsRaw] = await Promise.all([
    Promise.all(sections.map((s) => getPublishedEntries(s.id))),
    hasTravelSection ? getPublishedTravelPins() : Promise.resolve([]),
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
    <div>
      <section
        id="home"
        className="flex min-h-[80vh] flex-col justify-center px-6 py-16"
      >
        <div className="mx-auto flex w-full max-w-4xl items-center gap-6">
          {settings.hero_photo_path && (
            <Image
              src={getMediaUrl(settings.hero_photo_path)}
              alt={settings.owner_name ?? settings.site_title}
              width={settings.hero_photo_size ?? 96}
              height={settings.hero_photo_size ?? 96}
              style={{
                width: settings.hero_photo_size ?? 96,
                height: settings.hero_photo_size ?? 96,
                borderRadius: `${settings.hero_photo_radius ?? 50}%`,
              }}
              className="shrink-0 object-cover"
            />
          )}
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Ciao, sono{" "}
              {settings.owner_name ?? "una persona in continua crescita"}
            </h1>
            <p className="mt-3 max-w-2xl text-muted">
              {settings.tagline ??
                "Questo non è un CV. È un ritratto più completo di chi sono, oltre a competenze ed esperienze: valori, viaggi, attitudini e molto altro."}
            </p>
          </div>
        </div>

        {sections.length > 0 && (
          <a
            href={`#${sections[0].slug}`}
            className="mx-auto mt-16 flex flex-col items-center gap-2 text-xs text-muted transition-opacity hover:opacity-70"
          >
            Scorri per scoprire di più
            <span className="animate-bounce text-base">↓</span>
          </a>
        )}
      </section>

      {sections.length === 0 ? (
        <p className="mx-auto max-w-4xl px-6 text-sm text-muted">
          Nessuna sezione pubblicata ancora.
        </p>
      ) : (
        sections.map((section, index) => (
          <SectionBlock
            key={section.id}
            section={section}
            entries={entriesBySection[index]}
            index={index}
            travelPins={section.slug === "viaggi" ? travelPins : undefined}
          />
        ))
      )}

      <SectionDotNav
        sections={[
          { slug: "home", title: "Inizio" },
          ...sections.map((s) => ({ slug: s.slug, title: s.title })),
        ]}
      />
    </div>
  );
}
