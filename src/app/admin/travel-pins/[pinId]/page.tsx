import { notFound } from "next/navigation";
import Link from "next/link";
import { getTravelPinById, getTravelEntries } from "@/lib/admin-queries";
import { TravelPinForm } from "@/components/admin/TravelPinForm";
import { updateTravelPin } from "../actions";

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
    </div>
  );
}
