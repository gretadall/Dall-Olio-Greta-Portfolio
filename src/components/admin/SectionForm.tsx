"use client";

import { useActionState } from "react";
import type { Database } from "@/lib/supabase/types";
import { hintClass, inputClass, labelClass, primaryButtonClass } from "./ui";

type Section = Database["public"]["Tables"]["sections"]["Row"];
type FormState = { error?: string } | undefined;
type Action = (prevState: FormState, formData: FormData) => Promise<FormState>;

export function SectionForm({
  section,
  action,
  submitLabel,
}: {
  section?: Section;
  action: Action;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-[1fr_8rem]">
        <label className={labelClass}>
          Titolo
          <input name="title" required defaultValue={section?.title} className={inputClass} />
        </label>
        <label className={labelClass}>
          Icona
          <input
            name="icon"
            defaultValue={section?.icon ?? ""}
            placeholder="💼"
            className={`${inputClass} text-center`}
          />
        </label>
      </div>

      <label className={labelClass}>
        Descrizione
        <textarea
          name="description"
          rows={3}
          defaultValue={section?.description ?? ""}
          className={`${inputClass} resize-none`}
        />
        <span className={hintClass}>Appare sotto il titolo della sezione e sulla sua card.</span>
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Testo del link
          <input
            name="cta_label"
            defaultValue={section?.cta_label ?? "Scopri tutto"}
            placeholder="Scopri tutto"
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Indirizzo della pagina
          <input
            name="slug"
            defaultValue={section?.slug}
            placeholder="es. esperienze"
            className={inputClass}
          />
          <span className={hintClass}>Lascialo vuoto per generarlo dal titolo.</span>
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="is_published"
          defaultChecked={section?.is_published ?? true}
          className="accent-[var(--primary)]"
        />
        Pubblicata
      </label>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "Salvataggio…" : submitLabel}
      </button>
    </form>
  );
}
