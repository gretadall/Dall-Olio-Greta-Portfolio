"use client";

import dynamic from "next/dynamic";
import { useLayoutEffect, useEffect, useRef, useState } from "react";
import type { GlobeMethods } from "react-globe.gl";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

export type GlobePin = {
  id: string;
  label: string;
  country: string | null;
  lat: number;
  lng: number;
  href: string | null;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function TravelGlobe({
  pins,
  compact = false,
}: {
  pins: GlobePin[];
  compact?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [size, setSize] = useState(0);
  const maxSize = compact ? 340 : 520;

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    setSize(Math.min(el.getBoundingClientRect().width, maxSize));

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      setSize(Math.min(width, maxSize));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [maxSize]);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    globe.pointOfView({ lat: 25, lng: 15, altitude: 2.1 }, 0);
    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;
    controls.enableZoom = false;
  }, [size]);

  return (
    <div
      ref={containerRef}
      className="mx-auto flex w-full items-center justify-center"
      style={{ maxWidth: maxSize, aspectRatio: "1 / 1" }}
    >
      {size > 0 && (
        <Globe
          ref={globeRef}
          width={size}
          height={size}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl="/globe/earth-dark.jpg"
          showAtmosphere
          atmosphereColor="#f97316"
          atmosphereAltitude={0.18}
          htmlElementsData={pins}
          htmlLat="lat"
          htmlLng="lng"
          htmlAltitude={0.01}
          htmlElement={(d) => {
            const pin = d as GlobePin;
            const el = document.createElement(pin.href ? "a" : "div");
            if (pin.href) (el as HTMLAnchorElement).href = pin.href;
            el.className = `travel-pin${pin.href ? " travel-pin--linked" : ""}`;
            const sub = pin.country ? ` · ${escapeHtml(pin.country)}` : "";
            el.innerHTML = `
              <span class="travel-pin__flag">📍</span>
              <span class="travel-pin__label">${escapeHtml(pin.label)}${sub}</span>
            `;
            return el;
          }}
        />
      )}
    </div>
  );
}
