import Image from "next/image";
import { getMediaUrl } from "@/lib/supabase/media";
import { EditableText } from "@/components/edit/EditableText";

export function IntroBlock({
  ownerName,
  tagline,
  heroPhotoPath,
}: {
  ownerName: string;
  tagline: string;
  heroPhotoPath: string | null;
}) {
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-6 py-20 sm:flex-row">
      {heroPhotoPath && (
        <div className="relative aspect-[4/5] w-full max-w-xs shrink-0 overflow-hidden rounded-2xl sm:w-72">
          <Image
            src={getMediaUrl(heroPhotoPath)}
            alt={ownerName}
            fill
            sizes="(min-width: 640px) 18rem, 100vw"
            className="object-cover"
          />
        </div>
      )}
      <div>
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
      </div>
    </section>
  );
}
