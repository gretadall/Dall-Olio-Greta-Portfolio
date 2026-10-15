import Image from "next/image";
import { getSiteSettings } from "@/lib/queries";
import { getMediaUrl } from "@/lib/supabase/media";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { HomeContentForm } from "@/components/admin/HomeContentForm";
import { PhotoUploadForm } from "@/components/admin/PhotoUploadForm";
import { cardClass } from "@/components/admin/ui";
import { uploadHeroPhoto } from "./actions";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-4xl">Impostazioni</h1>
        <p className="mt-2 text-sm text-muted">Testi, colori e contatti del sito.</p>
      </div>

      <section className={cardClass}>
        <h2 className="mb-5 font-serif text-2xl">Generali</h2>
        <SettingsForm settings={settings} />
      </section>

      <section className={cardClass}>
        <h2 className="font-serif text-2xl">Foto profilo</h2>
        <p className="mt-1 text-sm text-muted">
          La foto grande della home e di &quot;Chi sono&quot;.
        </p>
        <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end">
          {settings.hero_photo_path && (
            <Image
              src={getMediaUrl(settings.hero_photo_path)}
              alt="Foto profilo"
              width={160}
              height={200}
              className="aspect-[4/5] w-32 rounded-2xl border border-line object-cover"
            />
          )}
          <PhotoUploadForm action={uploadHeroPhoto} submitLabel="Carica una nuova foto" />
        </div>
      </section>

      <section className={cardClass}>
        <h2 className="mb-5 font-serif text-2xl">Vision</h2>
        <HomeContentForm settings={settings} />
      </section>
    </div>
  );
}
