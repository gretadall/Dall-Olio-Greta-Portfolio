import { notFound } from "next/navigation";
import { getSectionBySlug, getPublishedEntries } from "@/lib/queries";
import { EntryCard } from "@/components/EntryCard";
import { SectionBackground } from "@/components/SectionBackground";

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section: slug } = await params;
  const section = await getSectionBySlug(slug);

  if (!section) notFound();

  const entries = await getPublishedEntries(section.id);

  return (
    <div className="relative mx-auto w-full max-w-4xl px-6 py-16">
      <SectionBackground imagePath={section.background_image_path} />
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
