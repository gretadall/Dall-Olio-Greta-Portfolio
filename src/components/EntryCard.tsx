import Link from "next/link";
import type { Database } from "@/lib/supabase/types";
import { formatPeriod } from "@/lib/format-date";
import { DeleteButton } from "@/components/edit/DeleteButton";
import { deleteEntry } from "@/app/admin/sections/[sectionId]/entries/actions";

type Entry = Database["public"]["Tables"]["entries"]["Row"];

export function EntryCard({ sectionSlug, entry }: { sectionSlug: string; entry: Entry }) {
  const period = formatPeriod(entry.period_start, entry.period_end);
  const meta = [period, entry.location].filter(Boolean).join(" · ");

  return (
    <Link
      href={`/${sectionSlug}/${entry.slug}`}
      className="group relative flex flex-col rounded-lg border border-line bg-surface p-6 transition-colors hover:border-primary/60"
    >
      <DeleteButton
        label={entry.title}
        action={deleteEntry.bind(null, entry.section_id, entry.id)}
      />
      {meta && (
        <p className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">{meta}</p>
      )}
      <h3 className={`text-lg font-semibold tracking-tight ${meta ? "mt-3" : ""}`}>
        {entry.title}
      </h3>
      {entry.description && (
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
          {entry.description}
        </p>
      )}
      <span className="mt-auto pt-6 font-mono text-[11px] tracking-[0.14em] text-primary uppercase">
        Scopri di più{" "}
        <span aria-hidden className="inline-block transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </span>
    </Link>
  );
}
