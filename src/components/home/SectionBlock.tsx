import Link from "next/link";
import Image from "next/image";
import type { Database } from "@/lib/supabase/types";
import { getMediaUrl } from "@/lib/supabase/media";
import { EntryCard } from "@/components/EntryCard";
import { TravelGlobe, type GlobePin } from "@/components/TravelGlobe";
import { Reveal } from "./Reveal";

type Section = Database["public"]["Tables"]["sections"]["Row"];
type Entry = Database["public"]["Tables"]["entries"]["Row"];

export function SectionBlock({
  section,
  entries,
  index,
  travelPins,
}: {
  section: Section;
  entries: Entry[];
  index: number;
  travelPins?: GlobePin[];
}) {
  const isFeature = index % 2 === 1;
  const isTravel = section.slug === "viaggi";
  const preview = entries.slice(0, 4);

  return (
    <section
      id={section.slug}
      className={
        isFeature
          ? "border-y border-black/[.06] bg-black/[.02] py-20 dark:border-white/[.08] dark:bg-white/[.03] sm:py-28"
          : "py-20 sm:py-28"
      }
    >
      <Reveal className="mx-auto w-full max-w-5xl px-6">
        {section.background_image_path && (
          <div className="mb-10 overflow-hidden rounded-2xl">
            <Image
              src={getMediaUrl(section.background_image_path)}
              alt=""
              width={1200}
              height={480}
              className="h-48 w-full object-cover sm:h-64"
            />
          </div>
        )}

        <div
          className={
            isFeature
              ? "grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-center md:gap-16"
              : "flex flex-col gap-10"
          }
        >
          <div>
            <div className="flex items-center gap-2">
              {section.icon && <span className="text-2xl">{section.icon}</span>}
              <span className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">
                {section.title}
              </span>
            </div>
            {section.description && (
              <p
                className={
                  isFeature
                    ? "mt-4 text-2xl leading-snug font-medium tracking-tight sm:text-3xl"
                    : "mt-3 max-w-xl text-muted"
                }
              >
                {section.description}
              </p>
            )}
            <Link
              href={`/${section.slug}`}
              className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary transition-opacity hover:opacity-70"
            >
              Scopri tutto →
            </Link>
          </div>

          <div>
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
              <p className="text-sm text-muted">
                Nessun contenuto pubblicato ancora.
              </p>
            ) : isFeature ? (
              <ul className="flex flex-col divide-y divide-black/[.06] dark:divide-white/[.08]">
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
                        <span className="shrink-0 text-xs text-muted">
                          {entry.location}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0">
                {preview.map((entry) => (
                  <div
                    key={entry.id}
                    className="w-[75vw] shrink-0 snap-start sm:w-auto"
                  >
                    <EntryCard sectionSlug={section.slug} entry={entry} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
