"use client";

import Link from "next/link";
import { ReorderableList } from "./ReorderableList";

type Pin = {
  id: string;
  label: string;
  country: string | null;
  is_published: boolean;
  entries: { title: string } | { title: string }[] | null;
};

export function TravelPinsAdminList({
  pins,
  onReorder,
  onDelete,
}: {
  pins: Pin[];
  onReorder: (orderedIds: string[]) => void | Promise<void>;
  onDelete: (pinId: string) => void | Promise<void>;
}) {
  return (
    <ReorderableList
      items={pins}
      onReorder={onReorder}
      renderItem={(pin, dragHandle) => {
        const linkedEntry = Array.isArray(pin.entries)
          ? pin.entries[0]
          : pin.entries;

        return (
          <div className="flex items-center justify-between gap-4 rounded-lg border border-black/[.08] p-4 dark:border-white/[.145]">
            <div className="flex min-w-0 items-center gap-3">
              <span
                onPointerDown={dragHandle.onPointerDown}
                className="touch-none cursor-grab select-none px-1 text-lg text-zinc-400 active:cursor-grabbing"
                aria-label="Trascina per riordinare"
              >
                ⠿
              </span>
              <span className="text-lg">📍</span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{pin.label}</span>
                  {!pin.is_published && (
                    <span className="rounded bg-yellow-500/15 px-2 py-0.5 text-xs text-yellow-700 dark:text-yellow-400">
                      Bozza
                    </span>
                  )}
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {pin.country ?? "—"}
                  {linkedEntry ? ` · collegato a "${linkedEntry.title}"` : ""}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={`/admin/travel-pins/${pin.id}`}
                className="rounded border border-black/[.12] px-3 py-1 text-xs dark:border-white/[.16]"
              >
                Modifica
              </Link>
              <button
                type="button"
                onClick={() => onDelete(pin.id)}
                className="rounded border border-red-600/30 px-3 py-1 text-xs text-red-600 dark:text-red-400"
              >
                Elimina
              </button>
            </div>
          </div>
        );
      }}
    />
  );
}
