import Image from "next/image";
import { getMediaUrl } from "@/lib/supabase/media";
import { EditableText } from "@/components/edit/EditableText";
import { Positionable } from "@/components/edit/Positionable";
import type { HomeLayout } from "@/lib/supabase/types";

export function IntroBlock({
  ownerName,
  tagline,
  heroPhotoPath,
  layout,
}: {
  ownerName: string;
  tagline: string;
  heroPhotoPath: string | null;
  layout: HomeLayout;
}) {
  return (
    <section className="square-canvas relative mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-6 py-20 sm:flex-row">
      {heroPhotoPath && (
        <Positionable
          slotKey="intro.photo"
          target={{ table: "site_settings" }}
          position={layout["intro.photo"] ?? null}
          className="w-full max-w-xs shrink-0 sm:w-72"
        >
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl">
            <Image
              src={getMediaUrl(heroPhotoPath)}
              alt={ownerName}
              fill
              sizes="(min-width: 640px) 18rem, 100vw"
              className="object-cover"
            />
          </div>
        </Positionable>
      )}
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
    </section>
  );
}
