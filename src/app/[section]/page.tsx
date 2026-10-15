import { notFound } from "next/navigation";
import {
  getSectionBySlug,
  getPublishedEntries,
  getPublishedTravelPins,
  getPersonalPhotos,
} from "@/lib/queries";
import { EntryCard } from "@/components/EntryCard";
import { PageBody, PageHeader } from "@/components/PageHeader";
import { TravelGlobe } from "@/components/TravelGlobe";
import { EditableText } from "@/components/edit/EditableText";
import { Eyebrow } from "@/components/home/SectionHeader";
import { buildGlobePins } from "@/lib/travel-pins";
import { T } from "@/components/UiTexts";
import { getVisitedCountryShapes } from "@/lib/globe-countries";

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section: slug } = await params;
  const section = await getSectionBySlug(slug);

  if (!section) notFound();

  const isTravel = section.slug === "viaggi";

  const [entries, travelPinsRaw, photos] = await Promise.all([
    getPublishedEntries(section.id),
    isTravel ? getPublishedTravelPins() : Promise.resolve([]),
    getPersonalPhotos(),
  ]);
  const coverOf = (entryId: string) => photos.find((p) => p.entryId === entryId)?.path ?? null;

  return (
    <>
      <PageHeader
        back={{ href: "/chi-sono", label: <T k="section.back" /> }}
        imagePath={section.background_image_path}
        label={
          <>
            <T k={entries.length === 1 ? "section.count.one" : "section.count.many"} vars={{ n: entries.length }} />
            {section.icon && <span aria-hidden className="not-italic">{section.icon}</span>}
          </>
        }
        title={
          <EditableText
            value={section.title}
            target={{ table: "sections", id: section.id, field: "title" }}
          />
        }
        intro={
          section.description && (
            <EditableText
              as="p"
              value={section.description}
              target={{ table: "sections", id: section.id, field: "description" }}
              multiline
            />
          )
        }
      />

      {isTravel && (
        <PageBody>
          <div className="rounded-[2rem] border border-line bg-surface px-4 py-8 sm:px-8 sm:py-10">
            <TravelGlobe
              pins={buildGlobePins(travelPinsRaw)}
              countries={getVisitedCountryShapes(travelPinsRaw)}
            />
          </div>
          <p className="mt-4 text-center text-sm text-muted">
            <T k="section.globeNote" />
          </p>
        </PageBody>
      )}

      <PageBody>
        {isTravel && (
          <div className="mb-10">
            <Eyebrow><T k="section.stories" /></Eyebrow>
          </div>
        )}
        {entries.length === 0 ? (
          <T as="p" className="text-muted" k="section.empty" />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => (
              <EntryCard
                key={entry.id}
                sectionSlug={section.slug}
                entry={entry}
                cover={coverOf(entry.id)}
              />
            ))}
          </div>
        )}
      </PageBody>
    </>
  );
}
