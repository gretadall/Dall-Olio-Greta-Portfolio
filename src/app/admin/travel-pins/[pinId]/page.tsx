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
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Luoghi visitati
      </Link>

      <h1 className="mt-4 font-serif text-4xl">
        {pin.label}
      </h1>

      <TravelPinForm
        pin={pin}
        entries={entries.map((e) => ({ id: e.id, title: e.title }))}
        action={boundUpdate}
        submitLabel="Salva luogo"
      />

      <div className="mt-8 max-w-md rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-serif text-2xl">
          Foto del luogo
        </h2>
        <p className="mt-1 text-sm text-muted">
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
                className="rounded-full border border-red-500/40 px-3 py-1 text-xs text-red-400 transition-colors hover:bg-red-500/10"
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
