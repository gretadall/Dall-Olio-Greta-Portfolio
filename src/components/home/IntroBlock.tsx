import Image from "next/image";
import { getMediaUrl } from "@/lib/supabase/media";
import { EditableText } from "@/components/edit/EditableText";
import { Positionable } from "@/components/edit/Positionable";
import type { HomeLayout } from "@/lib/supabase/types";

export function IntroBlock({
  ownerName,
  tagline,
  heroPhotoPath,
  linkedinUrl,
  contactEmail,
  layout,
  squares,
}: {
  ownerName: string;
  tagline: string;
  heroPhotoPath: string | null;
  linkedinUrl: string | null;
  contactEmail: string | null;
  layout: HomeLayout;
  squares: React.ReactNode;
}) {
  return (
    <section className="square-canvas relative mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-16 sm:flex-row sm:items-stretch">
      {heroPhotoPath && (
        <Positionable
          slotKey="intro.photo"
          target={{ table: "site_settings" }}
          position={layout["intro.photo"] ?? null}
          className="w-full shrink-0 sm:w-[34%]"
        >
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl sm:aspect-auto sm:h-full sm:min-h-[24rem]">
            <Image
              src={getMediaUrl(heroPhotoPath)}
              alt={ownerName}
              fill
              sizes="(min-width: 640px) 34vw, 100vw"
              className="object-cover"
            />
            {(linkedinUrl || contactEmail) && (
              <div className="absolute bottom-3 left-3 flex gap-2">
                {linkedinUrl && (
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="LinkedIn"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.11 20.45H3.56V9h3.55v11.45Z" />
                    </svg>
                  </a>
                )}
                {contactEmail && (
                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contactEmail)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Email"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m3 7 9 6 9-6" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
        </Positionable>
      )}
      <div className="flex flex-1 flex-col gap-6">
        <Positionable
          slotKey="intro.text"
          target={{ table: "site_settings" }}
          position={layout["intro.text"] ?? null}
        >
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Ciao, sono{" "}
            <EditableText
              value={ownerName}
              target={{ table: "site_settings", field: "owner_name" }}
            />
          </h1>
          <EditableText
            as="p"
            className="mt-3 max-w-xl text-muted"
            value={tagline}
            target={{ table: "site_settings", field: "tagline" }}
            multiline
          />
        </Positionable>
        {squares}
      </div>
    </section>
  );
}
