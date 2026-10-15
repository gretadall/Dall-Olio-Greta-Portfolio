import Image from "next/image";
import Link from "next/link";
import { getMediaUrl } from "@/lib/supabase/media";
import type { PersonalPhoto } from "@/lib/queries";

// A band of words sliding by, in the serif italic.
export function WordMarquee({ words }: { words: string[] }) {
  if (words.length === 0) return null;
  const run = (hidden: boolean) => (
    <ul aria-hidden={hidden} className="flex shrink-0 items-center">
      {words.map((word, i) => (
        <li key={i} className="flex items-center">
          <span className="px-6 font-serif text-4xl whitespace-nowrap italic sm:text-6xl">
            {word}
          </span>
          <span aria-hidden className="text-xl text-primary">✦</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="marquee overflow-hidden border-y border-line py-6 sm:py-8">
      <div className="marquee-track" style={{ ["--marquee-duration" as string]: "35s" }}>
        {run(false)}
        {run(true)}
      </div>
    </div>
  );
}

// Personal photos drifting sideways, each linking to its story.
export function PhotoMarquee({ photos }: { photos: PersonalPhoto[] }) {
  if (photos.length === 0) return null;
  const tilts = ["-2deg", "1.5deg", "-1deg", "2deg", "-1.5deg"];
  const run = (hidden: boolean) => (
    <ul aria-hidden={hidden} className="flex shrink-0 items-center gap-6 pr-6">
      {photos.map((photo, i) => (
        <li key={photo.id}>
          <Link
            href={photo.href}
            tabIndex={hidden ? -1 : undefined}
            className="group block w-56 rounded-xl bg-[#f6f1ee] p-2.5 pb-3 text-black shadow-xl transition-transform duration-300 hover:scale-105 sm:w-64"
            style={{ transform: `rotate(${tilts[i % tilts.length]})` }}
          >
            <span className="relative block aspect-[4/5] overflow-hidden rounded-md">
              <Image
                src={getMediaUrl(photo.path)}
                alt={hidden ? "" : photo.alt}
                fill
                sizes="256px"
                className="object-cover"
              />
            </span>
            <span className="mt-2.5 block truncate px-1 font-serif text-sm italic">{photo.title}</span>
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="marquee overflow-hidden py-10">
      <div
        className="marquee-track"
        style={{ ["--marquee-duration" as string]: `${Math.max(30, photos.length * 8)}s` }}
      >
        {run(false)}
        {run(true)}
      </div>
    </div>
  );
}
