import Link from "next/link";
import Image from "next/image";
import { getMediaUrl } from "@/lib/supabase/media";

const buttonClass =
  "rounded-full border border-black/[.12] px-4 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:border-black/[.24] dark:border-white/[.16] dark:text-zinc-300 dark:hover:border-white/[.3]";

const NAV_PHOTO_SIZE = 40;

export function Nav({
  siteTitle,
  heroPhotoPath,
  heroPhotoRadius = 50,
  linkedinUrl,
}: {
  siteTitle: string;
  heroPhotoPath: string | null;
  heroPhotoRadius?: number;
  linkedinUrl: string | null;
}) {
  return (
    <header className="border-b border-black/[.08] dark:border-white/[.145]">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          {heroPhotoPath && (
            <Image
              src={getMediaUrl(heroPhotoPath)}
              alt={siteTitle}
              width={NAV_PHOTO_SIZE}
              height={NAV_PHOTO_SIZE}
              style={{ borderRadius: `${heroPhotoRadius}%` }}
              className="h-10 w-10 shrink-0 object-cover"
            />
          )}
          <span className="text-lg font-semibold tracking-tight text-primary">
            {siteTitle}
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/rete" className={buttonClass}>
            Rete
          </Link>
          <Link href="/" className={buttonClass}>
            Chi sono
          </Link>
          {linkedinUrl && (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass}
            >
              LinkedIn
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
