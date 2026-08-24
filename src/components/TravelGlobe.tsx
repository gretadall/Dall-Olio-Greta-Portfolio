"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
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
  photoUrl: string | null;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatCoord(value: number, positive: string, negative: string) {
  return `${Math.abs(value).toFixed(2)}° ${value >= 0 ? positive : negative}`;
}

function PinVignette({ pin, onClose }: { pin: GlobePin; onClose: () => void }) {
  return (
    <div className="absolute inset-x-0 top-0 z-20 flex justify-center px-2">
      <div className="relative w-full max-w-[260px] overflow-hidden rounded-2xl border border-white/15 bg-black/85 text-white shadow-2xl backdrop-blur">
        <button
          type="button"
          onClick={onClose}
          aria-label="Chiudi"
          className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-xs leading-none transition-colors hover:bg-black/70"
        >
          ✕
        </button>
        {pin.photoUrl && (
          <Image
            src={pin.photoUrl}
            alt={pin.label}
            width={260}
            height={140}
            className="h-32 w-full object-cover"
          />
        )}
        <div className="p-3">
          <p className="text-sm font-semibold">
            {pin.label}
            {pin.country ? `, ${pin.country}` : ""}
          </p>
          <p className="mt-1 text-xs text-white/60">
            {formatCoord(pin.lat, "N", "S")} · {formatCoord(pin.lng, "E", "O")}
          </p>
          {pin.href && (
            <Link
              href={pin.href}
              className="mt-2 inline-block text-xs font-semibold text-primary"
            >
              Leggi il racconto →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function ExpandIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {expanded ? (
        <path d="M9 3v4a2 2 0 0 1-2 2H3M21 9h-4a2 2 0 0 1-2-2V3M3 15h4a2 2 0 0 1 2 2v4M15 21v-4a2 2 0 0 1 2-2h4" />
      ) : (
        <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
      )}
    </svg>
  );
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
  const [activePin, setActivePin] = useState<GlobePin | null>(null);
  const [expanded, setExpanded] = useState(false);
  const inlineMax = compact ? 340 : 520;
  const maxSize = expanded ? 640 : inlineMax;

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
    controls.enableZoom = expanded;
  }, [size, expanded]);

  useEffect(() => {
    if (!expanded) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setExpanded(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expanded]);

  return (
    <div
      className={
        expanded
          ? "fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/85 p-6 backdrop-blur-sm"
          : "relative mx-auto w-full"
      }
      style={expanded ? undefined : { maxWidth: inlineMax }}
    >
      {activePin && <PinVignette pin={activePin} onClose={() => setActivePin(null)} />}

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
              const el = document.createElement("div");
              el.className = `travel-pin${pin.href ? " travel-pin--linked" : ""}`;
              el.setAttribute("role", "button");
              el.setAttribute("tabindex", "0");
              const sub = pin.country ? ` · ${escapeHtml(pin.country)}` : "";
              el.innerHTML = `
                <span class="travel-pin__flag">📍</span>
                <span class="travel-pin__label">${escapeHtml(pin.label)}${sub}</span>
              `;
              el.onclick = (e) => {
                e.stopPropagation();
                setActivePin(pin);
              };
              el.onkeydown = (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActivePin(pin);
                }
              };
              return el;
            }}
          />
        )}
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-label={expanded ? "Rimpicciolisci il globo" : "Ingrandisci il globo"}
        className={
          expanded
            ? "rounded-full border border-white/30 px-4 py-2 text-sm text-white transition-colors hover:bg-white/10"
            : "absolute right-1 bottom-1 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition-colors hover:bg-black/70"
        }
      >
        {expanded ? (
          "Chiudi"
        ) : (
          <ExpandIcon expanded={false} />
        )}
      </button>
    </div>
  );
}
