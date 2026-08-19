import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  getSectionBySlug,
  getEntryBySlug,
  getEntryConnections,
  getEntryMedia,
} from "@/lib/queries";
import { getMediaUrl, isPdfPath } from "@/lib/supabase/media";
import { ConnectionsList } from "@/components/ConnectionsList";
import { SectionBackground } from "@/components/SectionBackground";
import { looksLikeHtml } from "@/lib/rich-content";

function formatPeriod(periodStart: string | null, periodEnd: string | null) {
  if (!periodStart) return null;
  const start = new Date(periodStart).getFullYear();
  const end = periodEnd ? new Date(periodEnd).getFullYear() : "presente";
  return start === end ? `${start}` : `${start} – ${end}`;
}

export default async function EntryPage({
  params,
}: {
  params: Promise<{ section: string; entry: string }>;
}) {
  const { section: sectionSlug, entry: entrySlug } = await params;
  const section = await getSectionBySlug(sectionSlug);

  if (!section) notFound();

  const entry = await getEntryBySlug(section.id, entrySlug);

  if (!entry) notFound();

  const [connections, media] = await Promise.all([
    getEntryConnections(entry.id),
    getEntryMedia(entry.id),
  ]);

  const period = formatPeriod(entry.period_start, entry.period_end);

  return (
    <div className="relative mx-auto w-full max-w-3xl px-6 py-16">
      <SectionBackground imagePath={section.background_image_path} />
      <Link
        href={`/${section.slug}`}
        className="text-sm text-muted transition-opacity hover:opacity-70"
      >
        ← {section.title}
      </Link>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        {entry.title}
      </h1>

      <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted">
        {period && <span>{period}</span>}
        {entry.location && <span>{entry.location}</span>}
      </div>

      {entry.description && (
        <p className="mt-6 text-lg text-muted">
          {entry.description}
        </p>
      )}

      {entry.body &&
        (looksLikeHtml(entry.body) ? (
          <div
            className="rich-content mt-6 text-muted"
            dangerouslySetInnerHTML={{ __html: entry.body }}
          />
        ) : (
          <div className="mt-6 whitespace-pre-wrap text-muted">
            {entry.body}
          </div>
        ))}

      {media.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {media.map((photo) =>
            isPdfPath(photo.storage_path) ? (
              <a
                key={photo.id}
                href={getMediaUrl(photo.storage_path)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border border-black/[.12] bg-zinc-50 text-sm text-muted transition-colors hover:border-black/[.24] dark:border-white/[.16] dark:bg-zinc-900 dark:hover:border-white/[.3]"
              >
                <span className="text-3xl">📄</span>
                {photo.alt_text || "Apri PDF"}
              </a>
            ) : (
              <Image
                key={photo.id}
                src={getMediaUrl(photo.storage_path)}
                alt={photo.alt_text ?? entry.title}
                width={300}
                height={300}
                className="aspect-square rounded-lg object-cover"
              />
            )
          )}
        </div>
      )}

      <ConnectionsList
        outgoing={connections.outgoing}
        incoming={connections.incoming}
      />
    </div>
  );
}
