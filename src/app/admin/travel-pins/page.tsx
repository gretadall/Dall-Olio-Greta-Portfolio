import Link from "next/link";
import { getAllTravelPins } from "@/lib/admin-queries";
import { TravelPinsAdminList } from "@/components/admin/TravelPinsAdminList";
import { deleteTravelPin, reorderTravelPins } from "./actions";

export default async function AdminTravelPinsPage() {
  const pins = await getAllTravelPins();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Luoghi visitati
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Le bandierine sul globo nella sezione Viaggi. Collega un luogo a
            un contenuto per renderlo cliccabile, oppure lascialo come
            semplice punto sulla mappa.
          </p>
        </div>
        <Link
          href="/admin/travel-pins/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium whitespace-nowrap text-white"
        >
          Nuovo luogo
        </Link>
      </div>

      {pins.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">
          Nessun luogo ancora. Aggiungi il primo per farlo comparire sul
          globo.
        </p>
      ) : (
        <div className="mt-6">
          <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
            Trascina l&apos;icona ⠿ per riordinare i luoghi.
          </p>
          <TravelPinsAdminList
            pins={pins}
            onReorder={reorderTravelPins}
            onDelete={deleteTravelPin}
          />
        </div>
      )}
    </div>
  );
}
