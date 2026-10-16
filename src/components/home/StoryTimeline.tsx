"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { T } from "@/components/UiTexts";

export type TimelineItem = {
  id: string;
  year: number;
  period: string;
  title: string;
  meta: string;
  href: string;
};

// The whole story in order, oldest first. On wide screens the year stays
// pinned on the left and ticks forward as you scroll past each step.
export function StoryTimeline({ items }: { items: TimelineItem[] }) {
  const listRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.5;
      const rows = [...list.querySelectorAll<HTMLElement>("[data-step]")];
      let current = 0;
      rows.forEach((row, i) => {
        if (row.getBoundingClientRect().top < line) current = i;
      });
      setActive(Math.min(current, items.length - 1));
      setAtEnd(current >= items.length);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [items.length]);

  const year = items[active]?.year;

  return (
    <div className="mt-14 grid gap-10 md:grid-cols-[11rem_1fr]">
      <div className="hidden md:block">
        <div className="sticky top-32" aria-hidden>
          <div className="font-serif text-7xl text-primary tabular-nums transition-all duration-300">
            {atEnd ? <T k="home.path.now" /> : year}
          </div>
          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${((atEnd ? items.length : active + 1) / (items.length + 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <ol ref={listRef} className="relative ml-2 border-l border-line md:ml-0">
        {items.map((item, i) => (
          <li key={item.id} data-step className="relative pb-12 pl-8">
            <span
              aria-hidden
              className={`absolute top-1.5 -left-[7px] h-3.5 w-3.5 rounded-full border-2 border-background transition-all duration-300 ${
                i <= active || atEnd
                  ? "scale-110 bg-primary shadow-[0_0_0_4px_color-mix(in_srgb,var(--primary)_25%,transparent)]"
                  : "bg-line"
              }`}
            />
            <Link href={item.href} className="group block max-w-2xl">
              <span className="text-xs font-medium tracking-[0.14em] text-muted uppercase tabular-nums">
                {item.period}
              </span>
              <span className="mt-1 block text-xl font-semibold tracking-tight transition-colors group-hover:text-primary">
                {item.title}
              </span>
              <span className="mt-1 block text-sm text-muted">{item.meta}</span>
            </Link>
          </li>
        ))}
        <li data-step className="relative pl-8">
          <span
            aria-hidden
            className={`absolute top-2 -left-[9px] h-[18px] w-[18px] rounded-full border-2 border-primary transition-colors ${
              atEnd ? "bg-primary" : "bg-background"
            }`}
          />
          <span className="font-serif text-3xl italic">
            <T k="home.path.now" />
          </span>
          <T as="p" className="mt-1 text-muted" k="home.path.nowText" />
        </li>
      </ol>
    </div>
  );
}
