import Link from "next/link";
import type { Database } from "@/lib/supabase/types";

type Entry = Database["public"]["Tables"]["entries"]["Row"];

function formatPeriod(entry: Entry) {
  if (!entry.period_start) return null;
  const start = new Date(entry.period_start).getFullYear();
  const end = entry.period_end ? new Date(entry.period_end).getFullYear() : "presente";
  return start === end ? `${start}` : `${start} – ${end}`;
}

export function EntryCard({
  sectionSlug,
  entry,
}: {
  sectionSlug: string;
  entry: Entry;
}) {
  const period = formatPeriod(entry);

  return (
    <Link
      href={`/${sectionSlug}/${entry.slug}`}
      className="group flex flex-col gap-1 rounded-xl border border-black/[.08] p-6 transition-colors hover:border-black/[.16] dark:border-white/[.145] dark:hover:border-white/[.3]"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-semibold tracking-tight">
          {entry.title}
        </h3>
        {period && (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {period}
          </span>
        )}
      </div>
      {entry.location && (
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {entry.location}
        </span>
      )}
      {entry.description && (
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {entry.description}
        </p>
      )}
    </Link>
  );
}
