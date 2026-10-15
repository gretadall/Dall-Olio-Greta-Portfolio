"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// A dotted flight route weaving behind the whole home page. The stretch
// already "flown" fills in pink and a small plane leads it, so scrolling
// feels like travelling somewhere: it lands on the contact block at the end.
// Place it inside a `relative isolate` wrapper; it sits behind the content.

const WAYPOINTS = 9;

function buildPath(w: number, h: number) {
  const left = Math.max(18, w * 0.04);
  const right = w - left;
  const end = { x: w / 2, y: h - Math.min(420, h * 0.08) };
  const points = Array.from({ length: WAYPOINTS }, (_, i) => ({
    x: i % 2 === 0 ? right : left,
    y: ((end.y - 40) * i) / (WAYPOINTS - 1) + 40,
  }));
  points[points.length - 1] = end;

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

  const d = useMemo(() => (size.w && size.h ? buildPath(size.w, size.h) : ""), [size]);

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
      {d && (
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
            <circle r="16" fill="var(--primary)" opacity="0.18" />
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
