"use client";

import Link from "next/link";
import { ReorderableList } from "./ReorderableList";

type BlogCategory = {
  id: string;
  name: string;
  slug: string;
  color: string;
};

export function BlogCategoriesAdminList({
  categories,
  onReorder,
  onDelete,
}: {
  categories: BlogCategory[];
  onReorder: (orderedIds: string[]) => void | Promise<void>;
  onDelete: (categoryId: string) => void | Promise<void>;
}) {
  return (
    <ReorderableList
      items={categories}
      onReorder={onReorder}
      renderItem={(category, dragHandle) => (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-black/[.08] p-4 dark:border-white/[.145]">
          <div className="flex min-w-0 items-center gap-3">
            <span
              onPointerDown={dragHandle.onPointerDown}
              className="touch-none cursor-grab select-none px-1 text-lg text-zinc-400 active:cursor-grabbing"
              aria-label="Trascina per riordinare"
            >
              ⠿
            </span>
            <span
              className="h-4 w-4 shrink-0 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <div className="min-w-0">
              <span className="font-medium">{category.name}</span>
              <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                /{category.slug}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/admin/blog/categories/${category.id}`}
              className="rounded border border-black/[.12] px-3 py-1 text-xs dark:border-white/[.16]"
            >
              Modifica
            </Link>
            <button
              type="button"
              onClick={() => onDelete(category.id)}
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
