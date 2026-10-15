import { notFound } from "next/navigation";
import {
  getSectionBySlug,
  getPublishedEntries,
  getPublishedTravelPins,
} from "@/lib/queries";
import { EntryCard } from "@/components/EntryCard";
import { PageBody, PageHeader } from "@/components/PageHeader";
import { TravelGlobe } from "@/components/TravelGlobe";
import { EditableText } from "@/components/edit/EditableText";
import { Eyebrow } from "@/components/home/SectionHeader";
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

  return (
    <>
      <PageHeader
        back={{ href: "/chi-sono", label: "Chi sono" }}
        label={
          <>
            {section.icon && <span aria-hidden className="text-sm tracking-normal">{section.icon}</span>}
            {entries.length} {entries.length === 1 ? "elemento" : "elementi"}
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
          <div className="rounded-lg border border-line bg-surface px-4 py-8 sm:px-8 sm:py-10">
            <TravelGlobe pins={buildGlobePins(travelPinsRaw)} />
          </div>
          <p className="mt-4 text-center text-sm text-muted">
            Ogni bandierina è un luogo in cui sono stata: cliccala per scoprirlo. Quelle in evidenza
            hanno anche un racconto da leggere.
          </p>
        </PageBody>
      )}

      <PageBody>
        {isTravel && (
          <div className="mb-10">
            <Eyebrow>Storie</Eyebrow>
          </div>
        )}
        {entries.length === 0 ? (
          <p className="text-muted">Nessun contenuto pubblicato ancora in questa sezione.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => (
              <EntryCard key={entry.id} sectionSlug={section.slug} entry={entry} />
            ))}
          </div>
        )}
      </PageBody>
    </>
  );
}
