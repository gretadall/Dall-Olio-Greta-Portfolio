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
          className="rounded-lg border border-black/[.12] bg-transparent px-4 py-2 text-sm outline-none focus:border-black/[.3] dark:border-white/[.16] dark:focus:border-white/[.4]"
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
        Etichetta (es. &quot;ha rafforzato&quot;)
        <input
          name="label"
          required
          placeholder="ha rafforzato"
          className="rounded-lg border border-black/[.12] bg-transparent px-4 py-2 text-sm outline-none focus:border-black/[.3] dark:border-white/[.16] dark:focus:border-white/[.4]"
        />
      </label>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Collegamento…" : "Aggiungi collegamento"}
      </button>
    </form>
  );
}
