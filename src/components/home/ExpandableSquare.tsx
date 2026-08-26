"use client";

import { useState } from "react";

export function ExpandableSquare({
  title,
  intro,
  body,
}: {
  title: string;
  intro: string | null;
  body: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-black/[.08] p-6 dark:border-white/[.145]">
      <h2 className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">
        {title}
      </h2>
      <p className="mt-3 text-sm text-muted">
        {intro || "Contenuto in arrivo."}
      </p>
      {body && (
        <>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="mt-3 flex items-center gap-1 text-sm font-medium text-primary transition-opacity hover:opacity-70"
          >
            {open ? "Mostra meno" : "Scopri di più"}
            <span
              className={`inline-block transition-transform ${open ? "rotate-180" : ""}`}
            >
              ▾
            </span>
          </button>
          <div
            className={`overflow-hidden transition-[max-height] duration-300 ${
              open ? "max-h-[2000px]" : "max-h-0"
            }`}
          >
            <div
              className="rich-content mt-3 text-sm text-muted"
              dangerouslySetInnerHTML={{ __html: body }}
            />
          </div>
        </>
      )}
    </div>
  );
}
