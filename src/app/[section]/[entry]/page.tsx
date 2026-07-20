import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getSectionBySlug,
  getEntryBySlug,
  getEntryLikeState,
  getEntryComments,
} from "@/lib/queries";
import { LikeButton } from "@/components/LikeButton";
import { CommentList } from "@/components/CommentList";
import { CommentForm } from "@/components/CommentForm";

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

  const [likeState, comments] = await Promise.all([
    getEntryLikeState(entry.id),
    getEntryComments(entry.id),
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

      {entry.body && (
        <div className="mt-6 whitespace-pre-wrap text-zinc-600 dark:text-zinc-400">
          {entry.body}
        </div>
      )}

      <div className="mt-8">
        <LikeButton
          entryId={entry.id}
          sectionSlug={section.slug}
          entrySlug={entry.slug}
          initialLiked={likeState.liked}
          initialCount={likeState.count}
          isAuthenticated={likeState.isAuthenticated}
        />
      </div>

      <div className="mt-12 border-t border-black/[.08] pt-8 dark:border-white/[.145]">
        <h2 className="text-lg font-semibold tracking-tight">Commenti</h2>

        <div className="mt-4">
          {likeState.isAuthenticated ? (
            <CommentForm
              entryId={entry.id}
              sectionSlug={section.slug}
              entrySlug={entry.slug}
            />
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              <Link href="/login" className="underline">
                Accedi
              </Link>{" "}
              per lasciare un commento.
            </p>
          )}
        </div>

        <div className="mt-6">
          <CommentList comments={comments} />
        </div>
      </div>
    </div>
  );
}
