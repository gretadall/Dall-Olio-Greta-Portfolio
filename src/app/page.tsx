import Image from "next/image";
import { getPublishedSections, getSiteSettings } from "@/lib/queries";
import { getMediaUrl } from "@/lib/supabase/media";
import { SectionCard } from "@/components/SectionCard";

export default async function Home() {
  const [sections, settings] = await Promise.all([
    getPublishedSections(),
    getSiteSettings(),
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <div className="flex items-center gap-6">
        {settings.hero_photo_path && (
          <Image
            src={getMediaUrl(settings.hero_photo_path)}
            alt={settings.owner_name ?? settings.site_title}
            width={96}
            height={96}
            className="rounded-full object-cover"
          />
        )}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Ciao, sono{" "}
            {settings.owner_name ?? "una persona in continua crescita"}
          </h1>
          <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">
            {settings.tagline ??
              "Questo non è un CV. È un ritratto più completo di chi sono, oltre a competenze ed esperienze: valori, viaggi, attitudini e molto altro."}
          </p>
        </div>
      </div>

      {sections.length === 0 ? (
        <p className="mt-12 text-sm text-zinc-500 dark:text-zinc-400">
          Nessuna sezione pubblicata ancora.
        </p>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {sections.map((section) => (
            <SectionCard key={section.id} section={section} />
          ))}
        </div>
      )}
    </div>
  );
}
