"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type SectionLink = { slug: string; title: string; icon: string | null };

const itemClass =
  "flex items-center gap-2 px-4 py-2.5 text-sm transition-colors hover:bg-black/[.04] dark:hover:bg-white/[.06]";

export function HamburgerMenu({
  sections,
  homeLabel,
  reteLabel,
  chiSonoLabel,
  blogLabel,
  linkedinUrl,
  linkedinLabel,
  contactEmail,
  contactLabel,
}: {
  sections: SectionLink[];
  homeLabel: string;
  reteLabel: string;
  chiSonoLabel: string;
  blogLabel: string;
  linkedinUrl: string | null;
  linkedinLabel: string;
  contactEmail: string | null;
  contactLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Chiudi menu" : "Apri menu"}
        aria-expanded={open}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/[.12] text-muted transition-colors hover:border-black/[.24] dark:border-white/[.16] dark:hover:border-white/[.3]"
      >
        <svg
          viewBox="0 0 24 24"
          width={18}
          height={18}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full right-0 z-30 mt-2 w-60 overflow-hidden rounded-xl border border-black/[.08] bg-background py-1 shadow-lg dark:border-white/[.145]">
          <Link href="/" onClick={() => setOpen(false)} className={itemClass}>
            {homeLabel}
          </Link>
          <Link href="/chi-sono" onClick={() => setOpen(false)} className={itemClass}>
            {chiSonoLabel}
          </Link>

          {sections.length > 0 && (
            <>
              <div className="my-1 border-t border-black/[.08] dark:border-white/[.145]" />
              {sections.map((s) => (
                <Link
                  key={s.slug}
                  href={`/chi-sono#${s.slug}`}
                  onClick={() => setOpen(false)}
                  className={itemClass}
                >
                  {s.icon && <span>{s.icon}</span>}
                  {s.title}
                </Link>
              ))}
            </>
          )}

          <div className="my-1 border-t border-black/[.08] dark:border-white/[.145]" />

          <Link href="/blog" onClick={() => setOpen(false)} className={itemClass}>
            {blogLabel}
          </Link>

          <div className="my-1 border-t border-black/[.08] dark:border-white/[.145]" />

          <Link href="/rete" onClick={() => setOpen(false)} className={itemClass}>
            {reteLabel}
          </Link>
          {linkedinUrl && (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className={itemClass}
            >
              {linkedinLabel}
            </a>
          )}
          {contactEmail && (
            <a
              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contactEmail)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className={itemClass}
            >
              {contactLabel}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
