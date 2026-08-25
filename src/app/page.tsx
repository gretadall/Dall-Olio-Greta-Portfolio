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
import { buildGlobePins } from "@/lib/travel-pins";

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

  const travelPins = buildGlobePins(travelPinsRaw);

  const hasHeroBackground = Boolean(settings.hero_background_image_path);

  return (
    <div>
      <section
        id="home"
        className="relative isolate flex min-h-[80vh] flex-col justify-center overflow-hidden px-6 py-16"
      >
        {settings.hero_background_image_path && (
          <Image
            src={getMediaUrl(settings.hero_background_image_path)}
            alt=""
            fill
            sizes="100vw"
            priority
            className="absolute inset-0 -z-20 object-cover"
          />
        )}

        <div className="relative mx-auto w-full max-w-4xl">
          {hasHeroBackground && (
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-x-8 -inset-y-10 -z-10 rounded-[2.5rem] blur-3xl"
              style={{
                backgroundColor: `rgba(0, 0, 0, ${(settings.hero_overlay_darkness ?? 55) / 100})`,
              }}
            />
          )}

          <div
            className={`flex items-center gap-6 ${hasHeroBackground ? "py-8 text-white" : ""}`}
          >
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
              <p
                className={`mt-3 max-w-2xl ${hasHeroBackground ? "text-white/80" : "text-muted"}`}
              >
                {settings.tagline ??
                  "Questo non è un CV. È un ritratto più completo di chi sono, oltre a competenze ed esperienze: valori, viaggi, attitudini e molto altro."}
              </p>
            </div>
          </div>
        </div>

        {sections.length > 0 && (
          <a
            href={`#${sections[0].slug}`}
            className={`relative z-10 mx-auto mt-16 flex flex-col items-center gap-2 text-xs transition-opacity hover:opacity-70 ${hasHeroBackground ? "text-white/80" : "text-muted"}`}
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
