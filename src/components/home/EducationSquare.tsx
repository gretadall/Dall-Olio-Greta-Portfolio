import Link from "next/link";
import { CARD_CLASS } from "./LinkSquare";
import type { Database } from "@/lib/supabase/types";

type Entry = Database["public"]["Tables"]["entries"]["Row"];

function formatSubtitle(entry: Entry) {
  if (entry.location) return entry.location;
  if (entry.period_start) {
    const start = new Date(entry.period_start).getFullYear();
    const end = entry.period_end
      ? new Date(entry.period_end).getFullYear()
      : "presente";
    return start === end ? `${start}` : `${start} – ${end}`;
  }
  return null;
}

export function EducationSquare({
  label,
  entries,
  href,
}: {
  label: string;
  entries: Entry[];
  href: string | null;
}) {
  const preview = entries.slice(0, 3);

  const content = (
    <>
      <div className="flex items-center gap-2">
        <span className="h-0.5 w-6 bg-primary" />
        <span className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">
          {label}
        </span>
      </div>
      <ul className="mt-4 flex flex-col gap-3">
        {preview.length === 0 ? (
          <li className="text-sm text-muted">Contenuto in arrivo.</li>
        ) : (
          preview.map((entry) => (
            <li key={entry.id} className="border-l-2 border-primary/40 pl-3">
              <p className="text-sm font-semibold text-foreground">{entry.title}</p>
              {formatSubtitle(entry) && (
                <p className="text-xs text-muted">{formatSubtitle(entry)}</p>
              )}
            </li>
          ))
        )}
      </ul>
    </>
  );

  if (!href) return <div className={CARD_CLASS}>{content}</div>;

  return (
    <Link href={href} className={`group ${CARD_CLASS}`}>
      {content}
    </Link>
  );
}
