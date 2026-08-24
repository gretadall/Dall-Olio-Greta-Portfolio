import { getTravelEntries } from "@/lib/admin-queries";
import { TravelPinForm } from "@/components/admin/TravelPinForm";
import { createTravelPin } from "../actions";

export default async function NewTravelPinPage() {
  const entries = await getTravelEntries();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Nuovo luogo</h1>
      <TravelPinForm
        entries={entries.map((e) => ({ id: e.id, title: e.title }))}
        action={createTravelPin}
        submitLabel="Aggiungi luogo"
      />
    </div>
  );
}
