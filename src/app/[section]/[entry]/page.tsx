import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  getSectionBySlug,
  getEntryBySlug,
  getEntryConnections,
  getEntryMedia,
  getPublishedEntries,
  getUiTexts,
} from "@/lib/queries";
import { T } from "@/components/UiTexts";
import { getMediaUrl, isPdfPath } from "@/lib/supabase/media";
import { formatPeriod } from "@/lib/format-date";
import { ConnectionsList } from "@/components/ConnectionsList";
import { PageBody, PageHeader } from "@/components/PageHeader";
import { looksLikeHtml } from "@/lib/rich-content";

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

  const [connections, media, siblings, texts] = await Promise.all([
    getEntryConnections(entry.id),
    getEntryMedia(entry.id),
    getPublishedEntries(section.id),
    getUiTexts(),
  ]);

  const index = siblings.findIndex((e) => e.id === entry.id);
  const prev = index > 0 ? siblings[index - 1] : null;
  const next = index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null;

  const cover = media.find((m) => /\.(jpe?g|webp|png)$/i.test(m.storage_path));
  const period = formatPeriod(entry.period_start, entry.period_end, texts["date.ongoing"]);
  const facts = [
    period && { key: "entry.period", value: period },
    entry.location && { key: "entry.place", value: entry.location },
  ].filter((f): f is { key: string; value: string } => Boolean(f));

  return (
    <>
      <PageHeader
        back={{ href: `/${section.slug}`, label: section.title }}
        imagePath={cover?.storage_path}
        label={
          <>
            {section.title}
            {section.icon && <span aria-hidden className="not-italic">{section.icon}</span>}
          </>
        }
        title={entry.title}
      >
        {facts.length > 0 && (
          <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-4">
            {facts.map((fact) => (
              <div key={fact.key}>
                <dt className="font-medium tabular-nums text-[11px] tracking-[0.14em] text-muted uppercase">
                  <T k={fact.key} />
                </dt>
                <dd className="mt-1">{fact.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </PageHeader>

      <PageBody>
        <article className="max-w-2xl">
          {entry.description && (
            <p className="font-serif text-2xl leading-snug">{entry.description}</p>
          )}

          {entry.body &&
            (looksLikeHtml(entry.body) ? (
              <div
                className="rich-content mt-6 leading-relaxed text-muted"
                dangerouslySetInnerHTML={{ __html: entry.body }}
              />
            ) : (
              <div className="mt-6 leading-relaxed whitespace-pre-wrap text-muted">{entry.body}</div>
            ))}
        </article>

        {media.length > 0 && (
          <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {media.map((photo) =>
              isPdfPath(photo.storage_path) ? (
                <a
                  key={photo.id}
                  href={getMediaUrl(photo.storage_path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border border-line bg-surface p-4 text-center text-sm text-muted transition-colors hover:border-primary/60 hover:text-foreground"
                >
                  <span aria-hidden className="text-3xl">📄</span>
                  {photo.alt_text || "Apri PDF"}
                </a>
              ) : (
                <Image
                  key={photo.id}
                  src={getMediaUrl(photo.storage_path)}
                  alt={photo.alt_text ?? entry.title}
                  width={400}
                  height={400}
                  sizes="(min-width: 640px) 33vw, 50vw"
                  className="aspect-square w-full rounded-2xl border border-line object-cover"
                />
              )
            )}
          </div>
        )}

        <ConnectionsList outgoing={connections.outgoing} incoming={connections.incoming} />
      </PageBody>

      {(prev || next) && (
        <nav aria-label="Altri elementi" className="border-t border-line">
          <div className="mx-auto grid max-w-6xl sm:grid-cols-2">
            {prev ? (
              <Link
                href={`/${section.slug}/${prev.slug}`}
                className="group border-b border-line px-5 py-8 sm:border-r sm:border-b-0 sm:px-8"
              >
                <span className="font-medium tabular-nums text-[11px] tracking-[0.14em] text-muted uppercase">
                  <T k="entry.prev" />
                </span>
                <span className="mt-2 block text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">
                  {prev.title}
                </span>
              </Link>
            ) : (
              <span className="hidden sm:block sm:border-r sm:border-line" />
            )}
            {next && (
              <Link
                href={`/${section.slug}/${next.slug}`}
                className="group px-5 py-8 text-right sm:px-8"
              >
                <span className="font-medium tabular-nums text-[11px] tracking-[0.14em] text-muted uppercase">
                  <T k="entry.next" />
                </span>
                <span className="mt-2 block text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">
                  {next.title}
                </span>
              </Link>
            )}
          </div>
        </nav>
      )}
    </>
  );
}
