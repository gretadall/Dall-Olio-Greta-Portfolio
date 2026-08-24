"use client";

import { useEffect, useState } from "react";

export function SectionDotNav({
  sections,
}: {
  sections: { slug: string; title: string }[];
}) {
  const [active, setActive] = useState(sections[0]?.slug ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    for (const s of sections) {
      const el = document.getElementById(s.slug);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [sections]);

  if (sections.length < 2) return null;

  return (
    <nav
      aria-label="Sezioni della pagina"
      className="fixed top-1/2 right-4 z-20 hidden -translate-y-1/2 flex-col items-end gap-3 lg:flex"
    >
      {sections.map((s) => (
        <a key={s.slug} href={`#${s.slug}`} className="group flex items-center gap-2">
          <span
            className={`overflow-hidden text-xs font-medium whitespace-nowrap text-muted transition-all duration-200 ${
              active === s.slug
                ? "max-w-[10rem] opacity-100"
                : "max-w-0 opacity-0 group-hover:max-w-[10rem] group-hover:opacity-100"
            }`}
          >
            {s.title}
          </span>
          <span
            className={`h-2 w-2 shrink-0 rounded-full border transition-all ${
              active === s.slug
                ? "scale-125 border-primary bg-primary"
                : "border-black/30 bg-transparent dark:border-white/30"
            }`}
          />
        </a>
      ))}
    </nav>
  );
}
