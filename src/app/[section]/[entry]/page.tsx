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
    <div className="mx-auto w-full max-w-3xl px-6 py-16">
      <Link
        href={`/${section.slug}`}
        className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        ← {section.title}
      </Link>

      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        {entry.title}
      </h1>

      <div className="mt-2 flex flex-wrap gap-3 text-sm text-zinc-500 dark:text-zinc-400">
        {period && <span>{period}</span>}
        {entry.location && <span>{entry.location}</span>}
      </div>

      {entry.description && (
        <p className="mt-6 text-lg text-zinc-700 dark:text-zinc-300">
          {entry.description}
        </p>
      )}

      {entry.body &&
        (looksLikeHtml(entry.body) ? (
          <div
            className="rich-content mt-6 text-zinc-600 dark:text-zinc-400"
            dangerouslySetInnerHTML={{ __html: entry.body }}
          />
        ) : (
          <div className="mt-6 whitespace-pre-wrap text-zinc-600 dark:text-zinc-400">
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
                className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border border-black/[.12] bg-zinc-50 text-sm text-zinc-600 transition-colors hover:border-black/[.24] dark:border-white/[.16] dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-white/[.3]"
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
