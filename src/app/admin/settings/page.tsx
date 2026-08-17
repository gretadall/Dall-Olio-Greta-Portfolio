import Image from "next/image";
import { getSiteSettings } from "@/lib/queries";
import { getMediaUrl } from "@/lib/supabase/media";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { PhotoUploadForm } from "@/components/admin/PhotoUploadForm";
import {
  uploadHeroPhoto,
  uploadBackgroundImage,
  removeBackgroundImage,
  uploadSplashImage,
  removeSplashImage,
} from "./actions";

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
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Grandezza e forma si regolano qui sopra, tra i colori.
        </p>
        {settings.hero_photo_path && (
          <Image
            src={getMediaUrl(settings.hero_photo_path)}
            alt="Foto profilo"
            width={settings.hero_photo_size ?? 96}
            height={settings.hero_photo_size ?? 96}
            style={{ borderRadius: `${settings.hero_photo_radius ?? 50}%` }}
            className="mt-4 object-cover"
          />
        )}
        <div className="mt-4">
          <PhotoUploadForm action={uploadHeroPhoto} submitLabel="Carica foto" />
        </div>
      </div>

      <div className="mt-12 border-t border-black/[.08] pt-8 dark:border-white/[.145]">
        <h2 className="text-lg font-semibold tracking-tight">
          Sfondo pagina
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Un&apos;immagine di sfondo per tutto il sito, al posto del solo
          colore.
        </p>
        {settings.background_image_path && (
          <>
            <Image
              src={getMediaUrl(settings.background_image_path)}
              alt="Sfondo pagina"
              width={240}
              height={135}
              className="mt-4 rounded-lg object-cover"
            />
            <form action={removeBackgroundImage} className="mt-3">
              <button
                type="submit"
                className="rounded border border-red-600/30 px-3 py-1 text-xs text-red-600 dark:text-red-400"
              >
                Rimuovi sfondo
              </button>
            </form>
          </>
        )}
        <div className="mt-4">
          <PhotoUploadForm
            action={uploadBackgroundImage}
            submitLabel="Carica sfondo"
          />
        </div>
      </div>

      <div className="mt-12 border-t border-black/[.08] pt-8 dark:border-white/[.145]">
        <h2 className="text-lg font-semibold tracking-tight">
          Immagine anteprima
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Mostrata nella pagina di anteprima, sopra titolo e messaggio, se
          l&apos;anteprima è attiva.
        </p>
        {settings.splash_image_path && (
          <>
            <Image
              src={getMediaUrl(settings.splash_image_path)}
              alt="Immagine anteprima"
              width={160}
              height={160}
              className="mt-4 rounded-lg object-cover"
            />
            <form action={removeSplashImage} className="mt-3">
              <button
                type="submit"
                className="rounded border border-red-600/30 px-3 py-1 text-xs text-red-600 dark:text-red-400"
              >
                Rimuovi immagine
              </button>
            </form>
          </>
        )}
        <div className="mt-4">
          <PhotoUploadForm
            action={uploadSplashImage}
            submitLabel="Carica immagine"
          />
        </div>
      </div>
    </div>
  );
}
