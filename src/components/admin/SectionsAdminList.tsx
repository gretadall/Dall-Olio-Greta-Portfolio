"use client";

import Link from "next/link";
import { ReorderableList } from "./ReorderableList";

type Section = {
  id: string;
  title: string;
  slug: string;
  icon: string | null;
  is_published: boolean;
};

export function SectionsAdminList({
  sections,
  onReorder,
  onDelete,
}: {
  sections: Section[];
  onReorder: (orderedIds: string[]) => void | Promise<void>;
  onDelete: (sectionId: string) => void | Promise<void>;
}) {
  return (
    <ReorderableList
      items={sections}
      onReorder={onReorder}
      renderItem={(section, dragHandle) => (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-black/[.08] p-4 dark:border-white/[.145]">
          <div className="flex min-w-0 items-center gap-3">
            <span
              onPointerDown={dragHandle.onPointerDown}
              className="touch-none cursor-grab select-none px-1 text-lg text-zinc-400 active:cursor-grabbing"
              aria-label="Trascina per riordinare"
            >
              ⠿
            </span>
            {section.icon && <span className="text-lg">{section.icon}</span>}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium">{section.title}</span>
                {!section.is_published && (
                  <span className="rounded bg-yellow-500/15 px-2 py-0.5 text-xs text-yellow-700 dark:text-yellow-400">
                    Bozza
                  </span>
                )}
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                /{section.slug}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/admin/sections/${section.id}`}
              className="rounded border border-black/[.12] px-3 py-1 text-xs dark:border-white/[.16]"
            >
              Modifica
            </Link>
            <button
              type="button"
              onClick={() => onDelete(section.id)}
              className="rounded border border-red-600/30 px-3 py-1 text-xs text-red-600 dark:text-red-400"
            >
              Elimina
            </button>
          </div>
        </div>
      )}
    />
  );
}
