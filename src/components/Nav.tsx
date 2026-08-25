import Link from "next/link";
import Image from "next/image";
import { getMediaUrl } from "@/lib/supabase/media";
import { HamburgerMenu } from "@/components/HamburgerMenu";

const buttonClass =
  "rounded-full border border-black/[.12] px-3 py-1 text-xs font-medium text-muted transition-colors hover:border-black/[.24] dark:border-white/[.16] dark:hover:border-white/[.3] sm:px-4 sm:py-1.5 sm:text-sm";

const NAV_PHOTO_SIZE = 40;

export function Nav({
  siteTitle,
  heroPhotoPath,
  heroPhotoRadius = 50,
  linkedinUrl,
  contactEmail,
  homeLabel,
  reteLabel,
  linkedinLabel,
  contactLabel,
  sections,
}: {
  siteTitle: string;
  heroPhotoPath: string | null;
  heroPhotoRadius?: number;
  linkedinUrl: string | null;
  contactEmail: string | null;
  homeLabel: string;
  reteLabel: string;
  linkedinLabel: string;
  contactLabel: string;
  sections: { slug: string; title: string; icon: string | null }[];
}) {
  return (
    <header className="border-b border-black/[.08] dark:border-white/[.145]">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
          {heroPhotoPath && (
            <Image
              src={getMediaUrl(heroPhotoPath)}
              alt={siteTitle}
              width={NAV_PHOTO_SIZE}
              height={NAV_PHOTO_SIZE}
              style={{ borderRadius: `${heroPhotoRadius}%` }}
              className="h-8 w-8 shrink-0 object-cover sm:h-10 sm:w-10"
            />
          )}
          <span className="truncate text-base font-semibold tracking-tight text-primary sm:text-lg">
            {siteTitle}
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link href="/rete" className={buttonClass}>
            {reteLabel}
          </Link>
          <Link href="/" className={buttonClass}>
            {homeLabel}
          </Link>
          {linkedinUrl && (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass}
            >
              {linkedinLabel}
            </a>
          )}
          {contactEmail && (
            <a
              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contactEmail)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass}
            >
              {contactLabel}
            </a>
          )}
          <HamburgerMenu
            sections={sections}
            homeLabel={homeLabel}
            reteLabel={reteLabel}
            linkedinUrl={linkedinUrl}
            linkedinLabel={linkedinLabel}
            contactEmail={contactEmail}
            contactLabel={contactLabel}
          />
        </div>
      </div>
    </header>
  );
}
