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
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-4">
          <div className="flex min-w-0 items-center gap-3">
            <span
              onPointerDown={dragHandle.onPointerDown}
              className="touch-none cursor-grab select-none px-1 text-lg text-muted active:cursor-grabbing"
              aria-label="Trascina per riordinare"
            >
              ⠿
            </span>
            {section.icon && <span className="text-lg">{section.icon}</span>}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium">{section.title}</span>
                {!section.is_published && (
                  <span className="rounded bg-yellow-500/15 px-2 py-0.5 text-xs text-yellow-400">
                    Bozza
                  </span>
                )}
              </div>
              <span className="text-xs text-muted">
                /{section.slug}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/admin/sections/${section.id}`}
              className="rounded-full border border-line px-3 py-1 text-xs transition-colors hover:border-primary hover:text-primary"
            >
              Modifica
            </Link>
            <button
              type="button"
              onClick={() => onDelete(section.id)}
              className="rounded-full border border-red-500/40 px-3 py-1 text-xs text-red-400 transition-colors hover:bg-red-500/10"
            >
              Elimina
            </button>
          </div>
        </div>
      )}
    />
  );
}
