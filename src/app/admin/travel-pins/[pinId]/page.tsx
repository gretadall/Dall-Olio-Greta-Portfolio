import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getTravelPinById, getTravelEntries } from "@/lib/admin-queries";
import { getMediaUrl } from "@/lib/supabase/media";
import { TravelPinForm } from "@/components/admin/TravelPinForm";
import { PhotoUploadForm } from "@/components/admin/PhotoUploadForm";
import {
  updateTravelPin,
  uploadTravelPinPhoto,
  removeTravelPinPhoto,
} from "../actions";

export default async function EditTravelPinPage({
  params,
}: {
  params: Promise<{ pinId: string }>;
}) {
  const { pinId } = await params;
  const [pin, entries] = await Promise.all([
    getTravelPinById(pinId),
    getTravelEntries(),
  ]);

  if (!pin) notFound();

  const boundUpdate = updateTravelPin.bind(null, pinId);
  const boundUploadPhoto = uploadTravelPinPhoto.bind(null, pinId);
  const boundRemovePhoto = removeTravelPinPhoto.bind(null, pinId);

  return (
    <div>
      <Link
        href="/admin/travel-pins"
        className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        ← Luoghi visitati
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        {pin.label}
      </h1>

      <TravelPinForm
        pin={pin}
        entries={entries.map((e) => ({ id: e.id, title: e.title }))}
        action={boundUpdate}
        submitLabel="Salva luogo"
      />

      <div className="mt-12 max-w-md border-t border-black/[.08] pt-8 dark:border-white/[.145]">
        <h2 className="text-lg font-semibold tracking-tight">
          Foto del luogo
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Compare nella vignetta quando qualcuno clicca su questa bandierina
          sul globo.
        </p>
        {pin.photo_path && (
          <>
            <Image
              src={getMediaUrl(pin.photo_path)}
              alt={pin.label}
              width={240}
              height={135}
              className="mt-4 rounded-lg object-cover"
            />
            <form action={boundRemovePhoto} className="mt-3">
              <button
                type="submit"
                className="rounded border border-red-600/30 px-3 py-1 text-xs text-red-600 dark:text-red-400"
              >
                Rimuovi foto
              </button>
            </form>
          </>
        )}
        <div className="mt-4">
          <PhotoUploadForm
            action={boundUploadPhoto}
            submitLabel="Carica foto"
          />
        </div>
      </div>
    </div>
  );
}
