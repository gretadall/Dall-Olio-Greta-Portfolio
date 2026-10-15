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
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-4">
            <div className="flex min-w-0 items-center gap-3">
              <span
                onPointerDown={dragHandle.onPointerDown}
                className="touch-none cursor-grab select-none px-1 text-lg text-muted active:cursor-grabbing"
                aria-label="Trascina per riordinare"
              >
                ⠿
              </span>
              <span className="text-lg">📍</span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{pin.label}</span>
                  {!pin.is_published && (
                    <span className="rounded bg-yellow-500/15 px-2 py-0.5 text-xs text-yellow-400">
                      Bozza
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted">
                  {pin.country ?? "—"}
                  {linkedEntry ? ` · collegato a "${linkedEntry.title}"` : ""}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={`/admin/travel-pins/${pin.id}`}
                className="rounded-full border border-line px-3 py-1 text-xs transition-colors hover:border-primary hover:text-primary"
              >
                Modifica
              </Link>
              <button
                type="button"
                onClick={() => onDelete(pin.id)}
                className="rounded-full border border-red-500/40 px-3 py-1 text-xs text-red-400 transition-colors hover:bg-red-500/10"
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
