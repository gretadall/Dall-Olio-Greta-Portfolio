import Link from "next/link";
import Image from "next/image";
import type { Database } from "@/lib/supabase/types";
import { getMediaUrl } from "@/lib/supabase/media";
import { TravelGlobe, type GlobePin } from "@/components/TravelGlobe";
import { Reveal } from "./Reveal";

type Section = Database["public"]["Tables"]["sections"]["Row"];
type Entry = Database["public"]["Tables"]["entries"]["Row"];

export function SectionBlock({
  section,
  entries,
  travelPins,
}: {
  section: Section;
  entries: Entry[];
  travelPins?: GlobePin[];
}) {
  const isTravel = section.slug === "viaggi";
  const preview = entries.slice(0, 4);
  const hasBackground = Boolean(section.background_image_path);

  return (
    <section id={section.slug} className="relative isolate overflow-hidden py-20 sm:py-28">
      {section.background_image_path && (
        <Image
          src={getMediaUrl(section.background_image_path)}
          alt=""
          fill
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover"
        />
      )}

      <Reveal className="relative z-10 mx-auto w-full max-w-5xl px-6">
        <div className="relative">
          {hasBackground && (
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-x-8 -inset-y-10 -z-10 rounded-[2.5rem] blur-3xl"
              style={{
                backgroundColor: `rgba(0, 0, 0, ${(section.home_overlay_darkness ?? 55) / 100})`,
              }}
            />
          )}

          <div className={hasBackground ? "py-8 text-white" : undefined}>
            <div className="flex items-center gap-2">
              {section.icon && <span className="text-2xl">{section.icon}</span>}
              <span
                className={`text-xs font-semibold tracking-[0.2em] uppercase ${
                  hasBackground ? "text-white/75" : "text-muted"
                }`}
              >
                {section.title}
              </span>
            </div>
            {section.description && (
              <p className="mt-4 max-w-2xl text-2xl leading-snug font-medium tracking-tight sm:text-3xl">
                {section.description}
              </p>
            )}
            <Link
              href={`/${section.slug}`}
              className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary transition-opacity hover:opacity-70"
            >
              Scopri tutto →
            </Link>

            <div className="mt-10">
              {isTravel ? (
                <div className="flex flex-col items-center gap-6">
                  <TravelGlobe pins={travelPins ?? []} compact />
                  {preview.length > 0 && (
                    <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
                      {preview.map((entry) => (
                        <li key={entry.id}>
                          <Link
                            href={`/${section.slug}/${entry.slug}`}
                            className="font-medium text-primary transition-opacity hover:opacity-70"
                          >
                            {entry.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : preview.length === 0 ? (
                <p className={`text-sm ${hasBackground ? "text-white/75" : "text-muted"}`}>
                  Nessun contenuto pubblicato ancora.
                </p>
              ) : (
                <ul
                  className={`flex flex-col divide-y ${
                    hasBackground
                      ? "divide-white/15"
                      : "divide-black/[.06] dark:divide-white/[.08]"
                  }`}
                >
                  {preview.map((entry) => (
                    <li key={entry.id}>
                      <Link
                        href={`/${section.slug}/${entry.slug}`}
                        className="group flex items-baseline justify-between gap-4 py-4"
                      >
                        <span className="font-medium tracking-tight transition-opacity group-hover:opacity-70">
                          {entry.title}
                        </span>
                        {entry.location && (
                          <span
                            className={`shrink-0 text-xs ${
                              hasBackground ? "text-white/60" : "text-muted"
                            }`}
                          >
                            {entry.location}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
