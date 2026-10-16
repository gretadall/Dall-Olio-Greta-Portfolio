"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// A dotted flight route running down the left margin of the home page. The
// stretch already "flown" fills in pink and a small plane leads it, so
// scrolling feels like travelling somewhere. It stays in the empty margin
// beside the content (never over text) and only shows when that margin is
// wide enough. Place it inside a `relative isolate` wrapper.

const CONTENT_WIDTH = 1152; // max-w-6xl, the width of every section
const MIN_MARGIN = 48;
const WAYPOINTS = 12;

function marginOf(w: number) {
  return (w - CONTENT_WIDTH) / 2;
}

function buildPath(w: number, h: number) {
  // Text starts 32px inside the content box; keep the plane (16px glow)
  // well clear of it.
  const left = 16;
  const right = marginOf(w) + 8;
  const points = Array.from({ length: WAYPOINTS }, (_, i) => ({
    x: i % 2 === 0 ? right : left,
    y: ((h - 80) * i) / (WAYPOINTS - 1) + 40,
  }));

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const dy = (b.y - a.y) / 2;
    d += ` C ${a.x} ${a.y + dy}, ${b.x} ${b.y - dy}, ${b.x} ${b.y}`;
  }
  return d;
}

export function FlightPath() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const flownRef = useRef<SVGPathElement>(null);
  const planeRef = useRef<SVGGElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: Math.round(width), h: Math.round(height) });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const fits = marginOf(size.w) >= MIN_MARGIN;
  const d = useMemo(
    () => (size.w && size.h && marginOf(size.w) >= MIN_MARGIN ? buildPath(size.w, size.h) : ""),
    [size]
  );

  useEffect(() => {
    const wrap = wrapRef.current;
    const route = routeRef.current;
    const flown = flownRef.current;
    const plane = planeRef.current;
    if (!wrap || !route || !flown || !plane || !d) return;

    const length = route.getTotalLength();
    flown.style.strokeDasharray = `${length}`;
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = wrap.getBoundingClientRect();
      // The plane sits a bit above the middle of the screen.
      const progress = Math.min(1, Math.max(0, (window.innerHeight * 0.55 - rect.top) / rect.height));
      const at = length * progress;
      flown.style.strokeDashoffset = `${length - at}`;
      const p = route.getPointAtLength(at);
      const ahead = route.getPointAtLength(Math.min(length, at + 2));
      const behind = route.getPointAtLength(Math.max(0, at - 2));
      const angle = (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI;
      plane.setAttribute("transform", `translate(${p.x} ${p.y}) rotate(${angle})`);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [d]);

  return (
    <div ref={wrapRef} aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      {fits && d && (
        <svg width={size.w} height={size.h} className="absolute inset-0 overflow-visible">
          <path
            ref={routeRef}
            d={d}
            fill="none"
            stroke="var(--primary)"
            strokeOpacity="0.28"
            strokeWidth="1.5"
            strokeDasharray="1 9"
            strokeLinecap="round"
          />
          <path
            ref={flownRef}
            d={d}
            fill="none"
            stroke="var(--primary)"
            strokeOpacity="0.75"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <g ref={planeRef}>
            <circle r="14" fill="var(--primary)" opacity="0.18" />
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
