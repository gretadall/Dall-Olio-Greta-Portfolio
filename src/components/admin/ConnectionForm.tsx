"use client";

import { useActionState } from "react";

type FormState = { error?: string } | undefined;
type Action = (
  prevState: FormState,
  formData: FormData
) => Promise<FormState>;

type EntryOption = {
  id: string;
  title: string;
  sectionTitle: string;
};

export function ConnectionForm({
  entries,
  action,
}: {
  entries: EntryOption[];
  action: Action;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  const bySection = entries.reduce<Record<string, EntryOption[]>>(
    (acc, entry) => {
      (acc[entry.sectionTitle] ??= []).push(entry);
      return acc;
    },
    {}
  );

  return (
    <form action={formAction} className="mt-4 flex flex-col gap-3 max-w-md">
      <label className="flex flex-col gap-1 text-sm">
        Collega a
        <select
          name="to_entry_id"
          required
          defaultValue=""
          className="rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
        >
          <option value="" disabled>
            Scegli un contenuto…
          </option>
          {Object.entries(bySection).map(([sectionTitle, opts]) => (
            <optgroup key={sectionTitle} label={sectionTitle}>
              {opts.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.title}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Etichetta (es. &quot;ha rafforzato&quot;) — facoltativa
        <input
          name="label"
          placeholder="ha rafforzato"
          className="rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
        />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="bidirectional" />
        Collegamento bidirezionale (vale in entrambe le direzioni)
      </label>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-[1.03] disabled:opacity-60"
      >
        {pending ? "Collegamento…" : "Aggiungi collegamento"}
      </button>
    </form>
  );
}
