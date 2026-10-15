"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { GlobeMethods } from "react-globe.gl";
import type { CountryShape } from "@/lib/globe-countries";
import { MiniGlobe } from "@/components/home/MiniGlobe";
import { T, useUiText } from "@/components/UiTexts";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

// The site's pink accent.
const PINK = "#f399d2";
const COUNTRY_CAP = "rgba(243, 153, 210, 0.55)";
const COUNTRY_SIDE = "rgba(243, 153, 210, 0.25)";
const COUNTRY_STROKE = "#fbd5ec";

const AUTO_ROTATE_SPEED = 0.7;
const RESUME_ROTATION_AFTER_MS = 3000;

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
            <Link href={pin.href} className="mt-2 inline-block text-xs font-semibold text-primary">
              <T k="globe.story" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function ExpandIcon() {
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
      <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

// Accessors handed to react-globe.gl live at module level so their identity
// never changes: a new closure makes the library rebuild every object.
const pinColor = (d: object) => ((d as GlobePin).href ? PINK : "#ffffff");
const pinLabel = (d: object) => {
  const pin = d as GlobePin;
  const sub = pin.country ? ` · ${escapeHtml(pin.country)}` : "";
  return `<div class="globe-tooltip">${escapeHtml(pin.label)}${sub}</div>`;
};
const countryCap = () => COUNTRY_CAP;
const countrySide = () => COUNTRY_SIDE;
const countryStroke = () => COUNTRY_STROKE;
const RENDERER_CONFIG = { antialias: true, alpha: true, powerPreference: "high-performance" as const };

export function TravelGlobe({
  pins,
  countries,
}: {
  pins: GlobePin[];
  countries: CountryShape[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [size, setSize] = useState(0);
  const [ready, setReady] = useState(false);
  const [activePin, setActivePin] = useState<GlobePin | null>(null);
  const [expanded, setExpanded] = useState(false);
  const maxSize = expanded ? 640 : 520;

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

  // Configure the scene once the library says it's ready (the component is
  // loaded lazily, so the ref is not there on first render).
  const onGlobeReady = useCallback(() => {
    const globe = globeRef.current;
    if (!globe) return;

    // Retina screens render 4-9x the pixels for no visible gain on a globe.
    globe.renderer().setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    globe.pointOfView({ lat: 38, lng: 12, altitude: 2 }, 0);

    const controls = globe.controls();
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = true;
    controls.autoRotateSpeed = AUTO_ROTATE_SPEED;
    controls.enableZoom = false;

    // Stop spinning while someone is dragging, pick it back up a bit later.
    controls.addEventListener("start", () => {
      controls.autoRotate = false;
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    });
    controls.addEventListener("end", () => {
      resumeTimer.current = setTimeout(() => {
        controls.autoRotate = true;
      }, RESUME_ROTATION_AFTER_MS);
    });

    setReady(true);
  }, []);

  useEffect(() => {
    const globe = globeRef.current;
    if (globe && ready) globe.controls().enableZoom = expanded;
  }, [expanded, ready]);

  useEffect(() => {
    if (!expanded) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setExpanded(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expanded]);

  // Don't render frames while the globe is scrolled out of view.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !ready) return;
    const observer = new IntersectionObserver(([entry]) => {
      const globe = globeRef.current;
      if (!globe) return;
      if (entry.isIntersecting) globe.resumeAnimation();
      else globe.pauseAnimation();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ready]);

  useEffect(() => () => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
  }, []);

  const onPointClick = useCallback((d: object) => setActivePin(d as GlobePin), []);

  const closeLabel = useUiText("globe.close");
  const countriesVisited = new Set(pins.map((p) => p.country).filter(Boolean)).size;

  return (
    <div
      className={
        expanded
          ? "fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/90 p-6 backdrop-blur-sm"
          : "relative mx-auto w-full max-w-[520px]"
      }
    >
      {activePin && <PinVignette pin={activePin} onClose={() => setActivePin(null)} />}

      <div className="mb-3 flex flex-col items-center gap-1.5 text-center">
        <p className="text-[11px] tracking-wide text-muted">
          <T k="globe.hint" />
          {expanded && <T k="globe.hintZoom" />}
        </p>
        <div className="flex items-center gap-4 text-xs text-muted">
          <span>
            <strong className="text-foreground">{countriesVisited}</strong> <T k="globe.countries" />
          </span>
          <span>
            <strong className="text-foreground">{pins.length}</strong> <T k="globe.stops" />
          </span>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative mx-auto flex w-full items-center justify-center"
        style={{ maxWidth: maxSize, aspectRatio: "1 / 1" }}
      >
        {/* Instant stand-in while three.js loads, cross-faded away when ready. */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${
            ready ? "opacity-0" : "animate-pulse opacity-100"
          }`}
        >
          <MiniGlobe pins={pins} />
        </div>
        {size > 0 && (
          <div className={`transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
            <Globe
              ref={globeRef}
              width={size}
              height={size}
              rendererConfig={RENDERER_CONFIG}
              onGlobeReady={onGlobeReady}
              backgroundColor="rgba(0,0,0,0)"
              globeImageUrl="/globe/earth-dark.jpg"
              showAtmosphere
              atmosphereColor={PINK}
              atmosphereAltitude={0.16}
              polygonsData={countries}
              polygonCapColor={countryCap}
              polygonSideColor={countrySide}
              polygonStrokeColor={countryStroke}
              polygonAltitude={0.008}
              polygonsTransitionDuration={0}
              pointsData={pins}
              pointLat="lat"
              pointLng="lng"
              pointColor={pinColor}
              pointAltitude={0.06}
              pointRadius={0.45}
              pointResolution={8}
              pointsTransitionDuration={0}
              pointLabel={pinLabel}
              onPointClick={onPointClick}
            />
          </div>
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
        {expanded ? closeLabel : <ExpandIcon />}
      </button>
    </div>
  );
}
