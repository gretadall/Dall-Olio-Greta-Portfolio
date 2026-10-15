"use client";

import { useActionState } from "react";
import type { Database } from "@/lib/supabase/types";

type Pin = Database["public"]["Tables"]["travel_pins"]["Row"];
type FormState = { error?: string } | undefined;
type Action = (
  prevState: FormState,
  formData: FormData
) => Promise<FormState>;

export function TravelPinForm({
  pin,
  entries,
  action,
  submitLabel,
}: {
  pin?: Pin;
  entries: { id: string; title: string }[];
  action: Action;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="mt-6 flex max-w-md flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Nome del luogo
        <input
          name="label"
          required
          defaultValue={pin?.label}
          placeholder="es. Reykjavík"
          className="rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Paese (opzionale)
        <input
          name="country"
          defaultValue={pin?.country ?? ""}
          placeholder="es. Islanda"
          className="rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
        />
      </label>

      <div className="flex gap-3">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Latitudine
          <input
            name="lat"
            type="number"
            step="any"
            required
            defaultValue={pin?.lat}
            placeholder="64.1466"
            className="rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Longitudine
          <input
            name="lng"
            type="number"
            step="any"
            required
            defaultValue={pin?.lng}
            placeholder="-21.9426"
            className="rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
          />
        </label>
      </div>
      <p className="-mt-2 text-xs text-muted">
        Trova le coordinate cercando il nome del luogo su Google Maps: tasto
        destro sul punto → sono i due numeri in cima al menu.
      </p>

      <label className="flex flex-col gap-1 text-sm">
        Collega a un contenuto di &quot;Viaggi&quot; (opzionale)
        <select
          name="entry_id"
          defaultValue={pin?.entry_id ?? ""}
          className="rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
        >
          <option value="">Nessuno — solo un punto sul globo</option>
          {entries.map((entry) => (
            <option key={entry.id} value={entry.id}>
              {entry.title}
            </option>
          ))}
        </select>
        <span className="text-xs text-muted">
          Se lo colleghi, la bandierina sul globo aprirà quel racconto.
        </span>
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="is_published"
          defaultChecked={pin?.is_published ?? true}
        />
        Pubblicato
      </label>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-[1.03] disabled:opacity-60"
      >
        {pending ? "Salvataggio…" : submitLabel}
      </button>
    </form>
  );
}
