"use client";

import { useActionState } from "react";
import type { Database } from "@/lib/supabase/types";
import { RichBodyEditor } from "@/components/admin/RichBodyEditor";
import { BRAIN_AREAS } from "@/lib/brain-areas";

type Entry = Database["public"]["Tables"]["entries"]["Row"];
type FormState = { error?: string } | undefined;
type Action = (
  prevState: FormState,
  formData: FormData
) => Promise<FormState>;

export function EntryForm({
  entry,
  action,
  submitLabel,
}: {
  entry?: Entry;
  action: Action;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4 max-w-md">
      <label className="flex flex-col gap-1 text-sm">
        Titolo
        <input
          name="title"
          required
          defaultValue={entry?.title}
          className="rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Slug (lascia vuoto per generarlo dal titolo)
        <input
          name="slug"
          defaultValue={entry?.slug}
          className="rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
        />
      </label>

      <div className="flex gap-4">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Inizio periodo
          <input
            type="date"
            name="period_start"
            defaultValue={entry?.period_start ?? ""}
            className="rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Fine periodo (vuoto = presente)
          <input
            type="date"
            name="period_end"
            defaultValue={entry?.period_end ?? ""}
            className="rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Luogo
        <input
          name="location"
          defaultValue={entry?.location ?? ""}
          className="rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Descrizione breve
        <textarea
          name="description"
          rows={2}
          defaultValue={entry?.description ?? ""}
          className="resize-none rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Testo completo
        {entry ? (
          <RichBodyEditor entryId={entry.id} initialContent={entry.body ?? ""} />
        ) : (
          <>
            <textarea
              name="body"
              rows={6}
              className="resize-none rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
            />
            <span className="text-xs text-muted">
              Dopo aver creato il contenuto potrai formattarlo con l&apos;editor
              completo e aggiungere foto/video direttamente nel testo.
            </span>
          </>
        )}
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Area cerebrale (posizione nella rete 3D)
        <select
          name="brain_area"
          defaultValue={entry?.brain_area ?? ""}
          className="rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
        >
          <option value="">— Automatica —</option>
          {BRAIN_AREAS.map((area) => (
            <option key={area.slug} value={area.slug}>
              {area.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          name="in_timeline"
          defaultChecked={entry?.metadata?.in_timeline === true}
          className="mt-1 accent-[var(--primary)]"
        />
        <span>
          Mostra nel percorso in home
          <span className="block text-xs text-muted">
            Serve la data di inizio. Scegli solo le tappe che contano: il percorso resta corto.
          </span>
        </span>
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="is_published"
          defaultChecked={entry?.is_published ?? true}
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
