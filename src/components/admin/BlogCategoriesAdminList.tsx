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
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-4">
          <div className="flex min-w-0 items-center gap-3">
            <span
              onPointerDown={dragHandle.onPointerDown}
              className="touch-none cursor-grab select-none px-1 text-lg text-muted active:cursor-grabbing"
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
              <span className="block text-xs text-muted">
                /{category.slug}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/admin/blog/categories/${category.id}`}
              className="rounded-full border border-line px-3 py-1 text-xs transition-colors hover:border-primary hover:text-primary"
            >
              Modifica
            </Link>
            <button
              type="button"
              onClick={() => onDelete(category.id)}
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
