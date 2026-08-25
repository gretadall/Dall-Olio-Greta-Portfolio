import Link from "next/link";
import type { Database } from "@/lib/supabase/types";
import { EditableText } from "@/components/edit/EditableText";
import { DeleteButton } from "@/components/edit/DeleteButton";
import { deleteEntry } from "@/app/admin/sections/[sectionId]/entries/actions";

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
      className="group relative flex flex-col gap-1 rounded-xl border border-black/[.08] p-6 transition-colors hover:border-black/[.16] dark:border-white/[.145] dark:hover:border-white/[.3]"
    >
      <DeleteButton
        label={entry.title}
        action={deleteEntry.bind(null, entry.section_id, entry.id)}
      />
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <EditableText
          as="h3"
          className="text-base font-semibold tracking-tight"
          value={entry.title}
          target={{ table: "entries", id: entry.id, field: "title" }}
        />
        {period && (
          <span className="text-xs text-muted">
            {period}
          </span>
        )}
      </div>
      {entry.location && (
        <span className="text-xs text-muted">
          {entry.location}
        </span>
      )}
      {entry.description && (
        <p className="mt-1 text-sm text-muted">
          {entry.description}
        </p>
      )}
    </Link>
  );
}
