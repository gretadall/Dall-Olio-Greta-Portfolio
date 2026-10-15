"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { getMediaUrl } from "@/lib/supabase/media";
import type { PersonalPhoto } from "@/lib/queries";

const AUTO_SPEED = 40; // px per second
const DRAG_THRESHOLD = 6; // px before a press counts as a drag, not a click
const FRICTION = 0.94; // per frame, for the glide after letting go
const TILTS = ["-2deg", "1.5deg", "-1deg", "2deg", "-1.5deg"];

// Personal photos drifting sideways in an endless loop. Grab them to scroll
// by hand (with a little glide when released); a plain click opens the story.
export function PhotoCarousel({ photos }: { photos: PersonalPhoto[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const state = useRef({
    offset: 0,
    velocity: 0, // px per second, from the last drag
    hovering: false,
    pointerId: null as number | null,
    dragging: false,
    startX: 0,
    startOffset: 0,
    lastX: 0,
    lastT: 0,
    suppressClick: false,
  });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const s = state.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let prev = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;
      // The track holds the photos twice; wrapping by one copy's width makes
      // the loop seamless in both directions.
      const loopWidth = track.scrollWidth / 2;

      if (!s.dragging) {
        if (Math.abs(s.velocity) > 5) {
          s.offset += s.velocity * dt;
          s.velocity *= FRICTION;
        } else {
          s.velocity = 0;
          if (!s.hovering && !reducedMotion) s.offset -= AUTO_SPEED * dt;
        }
      }
      if (loopWidth > 0) s.offset = ((s.offset % loopWidth) - loopWidth) % loopWidth;
      track.style.transform = `translate3d(${s.offset}px, 0, 0)`;
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  function onPointerDown(e: React.PointerEvent) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const s = state.current;
    s.pointerId = e.pointerId;
    s.dragging = false;
    s.velocity = 0;
    s.startX = s.lastX = e.clientX;
    s.startOffset = s.offset;
    s.lastT = performance.now();
    s.suppressClick = false;
  }

  function onPointerMove(e: React.PointerEvent) {
    const s = state.current;
    if (s.pointerId !== e.pointerId) return;
    const dx = e.clientX - s.startX;
    if (!s.dragging && Math.abs(dx) > DRAG_THRESHOLD) {
      s.dragging = true;
      // Only capture once it's really a drag, so simple clicks still reach links.
      viewportRef.current?.setPointerCapture(e.pointerId);
    }
    if (!s.dragging) return;
    const now = performance.now();
    const dt = (now - s.lastT) / 1000;
    if (dt > 0) s.velocity = (e.clientX - s.lastX) / dt;
    s.lastX = e.clientX;
    s.lastT = now;
    s.offset = s.startOffset + dx;
  }

  function onPointerUp(e: React.PointerEvent) {
    const s = state.current;
    if (s.pointerId !== e.pointerId) return;
    if (s.dragging) {
      s.suppressClick = true;
      // A pause before letting go means no glide.
      if (performance.now() - s.lastT > 80) s.velocity = 0;
    }
    s.dragging = false;
    s.pointerId = null;
  }

  if (photos.length === 0) return null;

  const run = (hidden: boolean) => (
    <ul aria-hidden={hidden} className="flex shrink-0 items-center gap-6 pr-6">
      {photos.map((photo, i) => (
        <li key={photo.id}>
          <Link
            href={photo.href}
            draggable={false}
            tabIndex={hidden ? -1 : undefined}
            className="group block w-56 rounded-xl bg-[#f6f1ee] p-2.5 pb-3 text-black shadow-xl transition-transform duration-300 hover:scale-105 sm:w-64"
            style={{ transform: `rotate(${TILTS[i % TILTS.length]})` }}
          >
            <span className="relative block aspect-[4/5] overflow-hidden rounded-md">
              <Image
                src={getMediaUrl(photo.path)}
                alt={hidden ? "" : photo.alt}
                fill
                draggable={false}
                sizes="256px"
                className="pointer-events-none object-cover"
              />
            </span>
            <span className="mt-2.5 block truncate px-1 font-serif text-sm italic">{photo.title}</span>
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <div
      ref={viewportRef}
      className="cursor-grab overflow-hidden py-10 select-none active:cursor-grabbing"
      style={{ touchAction: "pan-y" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") state.current.hovering = true;
      }}
      onPointerLeave={() => {
        state.current.hovering = false;
      }}
      onClickCapture={(e) => {
        // The release at the end of a drag must not open a photo.
        if (state.current.suppressClick) {
          e.preventDefault();
          e.stopPropagation();
          state.current.suppressClick = false;
        }
      }}
    >
      <div ref={trackRef} className="flex w-max will-change-transform">
        {run(false)}
        {run(true)}
      </div>
    </div>
  );
}
