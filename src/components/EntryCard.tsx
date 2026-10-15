import Link from "next/link";
import Image from "next/image";
import type { Database } from "@/lib/supabase/types";
import { formatPeriod } from "@/lib/format-date";
import { getUiTexts } from "@/lib/queries";
import { T } from "@/components/UiTexts";
import { getMediaUrl } from "@/lib/supabase/media";
import { DeleteButton } from "@/components/edit/DeleteButton";
import { deleteEntry } from "@/app/admin/sections/[sectionId]/entries/actions";

type Entry = Database["public"]["Tables"]["entries"]["Row"];

export async function EntryCard({
  sectionSlug,
  entry,
  cover,
}: {
  sectionSlug: string;
  entry: Entry;
  /** Storage path of a photo to show on top of the card. */
  cover?: string | null;
}) {
  const texts = await getUiTexts();
  const period = formatPeriod(entry.period_start, entry.period_end, texts["date.ongoing"]);
  const meta = [period, entry.location].filter(Boolean).join(" · ");

  return (
    <Link
      href={`/${sectionSlug}/${entry.slug}`}
      className="group reveal relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-[0_20px_60px_-30px_var(--primary)]"
    >
      <DeleteButton
        label={entry.title}
        action={deleteEntry.bind(null, entry.section_id, entry.id)}
      />
      {cover && (
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={getMediaUrl(cover)}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        {meta && (
          <p className="text-[11px] font-medium tracking-[0.14em] text-muted uppercase tabular-nums">
            {meta}
          </p>
        )}
        <h3 className={`text-lg font-semibold tracking-tight ${meta ? "mt-3" : ""}`}>
          {entry.title}
        </h3>
        {entry.description && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
            {entry.description}
          </p>
        )}
        <span className="mt-auto pt-6 font-serif text-sm text-primary italic">
          <T k="card.more" />{" "}
          <span aria-hidden className="inline-block not-italic transition-transform group-hover:translate-x-1">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
