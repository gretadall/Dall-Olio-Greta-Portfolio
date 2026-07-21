import Image from "next/image";
import { getSiteSettings } from "@/lib/queries";
import { getMediaUrl } from "@/lib/supabase/media";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { PhotoUploadForm } from "@/components/admin/PhotoUploadForm";
import { uploadHeroPhoto } from "./actions";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Impostazioni</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Personalizza titolo, colori e font del sito.
      </p>
      <SettingsForm settings={settings} />

      <div className="mt-12 border-t border-black/[.08] pt-8 dark:border-white/[.145]">
        <h2 className="text-lg font-semibold tracking-tight">Foto profilo</h2>
        {settings.hero_photo_path && (
          <Image
            src={getMediaUrl(settings.hero_photo_path)}
            alt="Foto profilo"
            width={120}
            height={120}
            className="mt-4 rounded-full object-cover"
          />
        )}
        <div className="mt-4">
          <PhotoUploadForm action={uploadHeroPhoto} submitLabel="Carica foto" />
        </div>
      </div>
    </div>
  );
}
