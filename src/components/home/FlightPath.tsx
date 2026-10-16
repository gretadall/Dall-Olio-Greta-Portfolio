"use client";

import { useEffect, useRef, useState } from "react";

// A dotted flight route weaving across the whole home page. The stretch
// already "flown" fills in pink and a small plane leads it, so scrolling
// feels like travelling somewhere; it lands on the contact block at the end.
//
// The route is laid out around the real page so it never runs over text:
// it travels down the side strips (the padding outside the text) and only
// swings across the page in the empty gaps between sections. Place it as the
// first child of a `relative isolate` wrapper whose other children are the
// sections; it sits behind them.

const MIN_STRIP = 28; // narrower side strips (phones) get no route
const PLANE_SIZE = 30; // glow diameter at scale 1

type Layout = { w: number; h: number; d: string; scale: number };

function measure(wrap: HTMLElement): Layout | null {
  const box = wrap.getBoundingClientRect();
  const sections = [...(wrap.parentElement?.children ?? [])].filter(
    (el): el is HTMLElement => el instanceof HTMLElement && el !== wrap && el.tagName === "SECTION"
  );
  if (sections.length < 2) return null;

  // Where each section's actual content (inside its padding) starts and ends,
  // relative to the wrapper.
  const blocks = sections.map((section) => {
    const first = section.firstElementChild as HTMLElement | null;
    const last = section.lastElementChild as HTMLElement | null;
    const top = first
      ? first.getBoundingClientRect().top + parseFloat(getComputedStyle(first).paddingTop)
      : section.getBoundingClientRect().top;
    const bottom = last
      ? last.getBoundingClientRect().bottom - parseFloat(getComputedStyle(last).paddingBottom)
      : section.getBoundingClientRect().bottom;
    return { top: top - box.top, bottom: bottom - box.top };
  });

  // Free strip on each side: from the window edge to where the text begins.
  const sample = sections[0].firstElementChild as HTMLElement | null;
  if (!sample) return null;
  const sampleBox = sample.getBoundingClientRect();
  const strip = sampleBox.left - box.left + parseFloat(getComputedStyle(sample).paddingLeft);
  if (strip < MIN_STRIP) return null;

  const scale = Math.min(1, (strip - 4) / PLANE_SIZE);
  const sides = [strip / 2, box.width - strip / 2];

  // Start on the left, at the top of the first section's content.
  let side = 0;
  let d = `M ${sides[side]} ${Math.max(0, blocks[0].top - 40)}`;

  for (let i = 0; i < blocks.length - 1; i++) {
    const gapTop = blocks[i].bottom;
    const gapBottom = blocks[i + 1].top;
    const gap = gapBottom - gapTop;
    if (gap < 40) continue;
    const mid = (gapTop + gapBottom) / 2;
    const k = Math.min(70, gap / 2 - 14);
    const from = sides[side];
    const isLast = i === blocks.length - 2;
    // The last swing lands in the middle, just above the contact block.
    const to = isLast ? box.width / 2 : sides[1 - side];
    const end = isLast ? gapBottom - 10 : mid + k;
    // Down the side strip, then an S-curve that stays inside the empty gap.
    d += ` L ${from} ${mid - k}`;
    d += ` C ${from} ${mid}, ${to} ${isLast ? mid - k / 2 : mid}, ${to} ${end}`;
    side = 1 - side;
  }

  return { w: Math.round(box.width), h: Math.round(box.height), d, scale };
}

export function FlightPath() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const flownRef = useRef<SVGPathElement>(null);
  const planeRef = useRef<SVGGElement>(null);
  const [layout, setLayout] = useState<Layout | null>(null);

  // Re-plan the route whenever the page around it changes size (fonts and
  // images loading, window resizing).
  useEffect(() => {
    const wrap = wrapRef.current;
    const page = wrap?.parentElement;
    if (!wrap || !page) return;
    let frame = 0;
    const replan = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setLayout(measure(wrap));
      });
    };
    const observer = new ResizeObserver(replan);
    observer.observe(page);
    window.addEventListener("resize", replan);
    document.fonts?.ready.then(replan);
    replan();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", replan);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const route = routeRef.current;
    const flown = flownRef.current;
    const plane = planeRef.current;
    if (!wrap || !route || !flown || !plane || !layout) return;

    const length = route.getTotalLength();
    flown.style.strokeDasharray = `${length}`;
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = wrap.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (window.innerHeight * 0.55 - rect.top) / rect.height));
      const at = length * progress;
      flown.style.strokeDashoffset = `${length - at}`;
      const p = route.getPointAtLength(at);
      const ahead = route.getPointAtLength(Math.min(length, at + 2));
      const behind = route.getPointAtLength(Math.max(0, at - 2));
      const angle = (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI;
      plane.setAttribute(
        "transform",
        `translate(${p.x} ${p.y}) rotate(${angle}) scale(${layout.scale})`
      );
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
  }, [layout]);

  return (
    <div ref={wrapRef} aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      {layout && (
        <svg width={layout.w} height={layout.h} className="absolute inset-0 overflow-visible">
          <path
            ref={routeRef}
            d={layout.d}
            fill="none"
            stroke="var(--primary)"
            strokeOpacity="0.28"
            strokeWidth="1.5"
            strokeDasharray="1 9"
            strokeLinecap="round"
          />
          <path
            ref={flownRef}
            d={layout.d}
            fill="none"
            stroke="var(--primary)"
            strokeOpacity="0.75"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <g ref={planeRef}>
            <circle r={PLANE_SIZE / 2} fill="var(--primary)" opacity="0.18" />
            {/* Plane pointing right (0°), rotated along the route. */}
            <path
              d="M 9 0 L -3 -2 L -7 -8 L -9 -8 L -6 -2 L -10 -2 L -12 -5 L -13 -5 L -12 0 L -13 5 L -12 5 L -10 2 L -6 2 L -9 8 L -7 8 L -3 2 Z"
              fill="var(--primary)"
            />
          </g>
        </svg>
      )}
    </div>
  );
}
