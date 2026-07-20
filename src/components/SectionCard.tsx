import Link from "next/link";
import type { Database } from "@/lib/supabase/types";

type Section = Database["public"]["Tables"]["sections"]["Row"];

export function SectionCard({ section }: { section: Section }) {
  return (
    <Link
      href={`/${section.slug}`}
      className="group flex flex-col gap-2 rounded-xl border border-black/[.08] p-6 transition-colors hover:border-black/[.16] dark:border-white/[.145] dark:hover:border-white/[.3]"
    >
      <div className="flex items-center gap-2">
        {section.icon && <span className="text-xl">{section.icon}</span>}
        <h2 className="text-lg font-semibold tracking-tight">
          {section.title}
        </h2>
      </div>
      {section.description && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {section.description}
        </p>
      )}
    </Link>
  );
}
