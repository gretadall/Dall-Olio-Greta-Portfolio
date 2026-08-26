"use client";

import { useState } from "react";
import Link from "next/link";
import { Positionable } from "@/components/edit/Positionable";
import { EditableText } from "@/components/edit/EditableText";
import type { Database, HomeLayout } from "@/lib/supabase/types";

type Section = Database["public"]["Tables"]["sections"]["Row"];
type Entry = Database["public"]["Tables"]["entries"]["Row"];

export function ValoriSquare({
  section,
  entries,
}: {
  section: Section | null;
  entries: Entry[];
}) {
  const [open, setOpen] = useState(false);

  const title = section?.title ?? "Valori";
  const icon = section?.icon ?? null;
  const ctaLabel = section?.cta_label ?? "Scopri tutto";
  const layout: HomeLayout = section?.home_layout ?? {};
  const target = section ? { table: "sections" as const, id: section.id } : null;

  const titleEl = (
    <div className="flex items-center gap-2">
      {target ? (
        <EditableText
          as="span"
          className="text-2xl leading-none"
          value={icon ?? ""}
          target={{ table: "sections", id: target.id, field: "icon" }}
        />
      ) : (
        icon && <span className="text-2xl leading-none">{icon}</span>
      )}
      <h2 className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">
        {title}
      </h2>
    </div>
  );

  return (
    <div className="square-canvas relative rounded-xl border border-black/[.08] p-6 dark:border-white/[.145]">
      {target ? (
        <Positionable slotKey="title" target={target} position={layout.title ?? null}>
          {titleEl}
        </Positionable>
      ) : (
        titleEl
      )}

      <div className="mt-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex items-center gap-1 text-sm font-medium text-primary transition-opacity hover:opacity-70"
        >
          {target ? (
            <EditableText
              as="span"
              value={ctaLabel}
              target={{ table: "sections", id: target.id, field: "cta_label" }}
            />
          ) : (
            ctaLabel
          )}
          <span
            className={`inline-block transition-transform ${open ? "rotate-180" : ""}`}
          >
            ▾
          </span>
        </button>

        <div
          className={`overflow-hidden transition-[max-height] duration-300 ${
            open ? "max-h-96" : "max-h-0"
          }`}
        >
          {entries.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Nessun valore pubblicato ancora.</p>
          ) : (
            <ul className="mt-3 flex flex-col divide-y divide-black/[.06] dark:divide-white/[.08]">
              {entries.map((entry) => (
                <li key={entry.id}>
                  <Link
                    href={`/${section?.slug}/${entry.slug}`}
                    className="block py-2 text-sm font-medium transition-opacity hover:opacity-70"
                  >
                    {entry.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
