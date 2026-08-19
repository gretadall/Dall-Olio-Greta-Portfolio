"use client";

import Link from "next/link";
import { ReorderableList } from "./ReorderableList";

type Entry = {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
};

export function EntriesAdminList({
  entries,
  sectionSlug,
  sectionId,
  onReorder,
  onDelete,
}: {
  entries: Entry[];
  sectionSlug: string;
  sectionId: string;
  onReorder: (orderedIds: string[]) => void | Promise<void>;
  onDelete: (entryId: string) => void | Promise<void>;
}) {
  return (
    <ReorderableList
      items={entries}
      onReorder={onReorder}
      renderItem={(entry, dragHandle) => (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-black/[.08] p-4 dark:border-white/[.145]">
          <div className="flex min-w-0 items-center gap-3">
            <span
              onPointerDown={dragHandle.onPointerDown}
              className="touch-none cursor-grab select-none px-1 text-lg text-zinc-400 active:cursor-grabbing"
              aria-label="Trascina per riordinare"
            >
              ⠿
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium">{entry.title}</span>
                {!entry.is_published && (
                  <span className="rounded bg-yellow-500/15 px-2 py-0.5 text-xs text-yellow-700 dark:text-yellow-400">
                    Bozza
                  </span>
                )}
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                /{sectionSlug}/{entry.slug}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/admin/sections/${sectionId}/entries/${entry.id}`}
              className="rounded border border-black/[.12] px-3 py-1 text-xs dark:border-white/[.16]"
            >
              Modifica
            </Link>
            <button
              type="button"
              onClick={() => onDelete(entry.id)}
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
