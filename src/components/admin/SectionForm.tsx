"use client";

import { useActionState, useState } from "react";
import type { Database } from "@/lib/supabase/types";

type Section = Database["public"]["Tables"]["sections"]["Row"];
type FormState = { error?: string } | undefined;
type Action = (
  prevState: FormState,
  formData: FormData
) => Promise<FormState>;

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
  const [backgroundOpacity, setBackgroundOpacity] = useState(
    section?.background_opacity ?? 100
  );
  const [homeOverlayDarkness, setHomeOverlayDarkness] = useState(
    section?.home_overlay_darkness ?? 55
  );

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4 max-w-md">
      <label className="flex flex-col gap-1 text-sm">
        Titolo
        <input
          name="title"
          required
          defaultValue={section?.title}
          className="rounded-lg border border-black/[.12] bg-transparent px-4 py-2 text-sm outline-none focus:border-black/[.3] dark:border-white/[.16] dark:focus:border-white/[.4]"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Slug (lascia vuoto per generarlo dal titolo)
        <input
          name="slug"
          defaultValue={section?.slug}
          placeholder="es. esperienze"
          className="rounded-lg border border-black/[.12] bg-transparent px-4 py-2 text-sm outline-none focus:border-black/[.3] dark:border-white/[.16] dark:focus:border-white/[.4]"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Icona (emoji, opzionale)
        <input
          name="icon"
          defaultValue={section?.icon ?? ""}
          placeholder="💼"
          className="rounded-lg border border-black/[.12] bg-transparent px-4 py-2 text-sm outline-none focus:border-black/[.3] dark:border-white/[.16] dark:focus:border-white/[.4]"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Colore nel grafo (Rete)
        <input
          type="color"
          name="color"
          defaultValue={section?.color ?? "#888888"}
          className="h-10 w-full rounded-lg border border-black/[.12] bg-transparent dark:border-white/[.16]"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Descrizione
        <textarea
          name="description"
          rows={3}
          defaultValue={section?.description ?? ""}
          className="resize-none rounded-lg border border-black/[.12] bg-transparent px-4 py-2 text-sm outline-none focus:border-black/[.3] dark:border-white/[.16] dark:focus:border-white/[.4]"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Opacità sfondo ({backgroundOpacity}%)
        <input
          type="range"
          name="background_opacity"
          min={0}
          max={100}
          value={backgroundOpacity}
          onChange={(e) => setBackgroundOpacity(Number(e.target.value))}
        />
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Abbassala se il testo sopra lo sfondo è faticoso da leggere.
        </span>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Scurità sfondo in home ({homeOverlayDarkness}%)
        <input
          type="range"
          name="home_overlay_darkness"
          min={0}
          max={100}
          value={homeOverlayDarkness}
          onChange={(e) => setHomeOverlayDarkness(Number(e.target.value))}
        />
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          L&apos;alone scuro dietro al testo, quando questa sezione appare
          nella home con la sua foto di sfondo.
        </span>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Dove appare
        <select
          name="page_placement"
          defaultValue={section?.page_placement ?? "standalone"}
          className="rounded-lg border border-black/[.12] bg-transparent px-4 py-2 text-sm outline-none focus:border-black/[.3] dark:border-white/[.16] dark:focus:border-white/[.4]"
        >
          <option value="standalone">
            Pagina a sé (raggiungibile solo dal proprio link)
          </option>
          <option value="chi_sono">
            Nella pagina &quot;Chi sono&quot; (scorrimento)
          </option>
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="is_published"
          defaultChecked={section?.is_published ?? true}
        />
        Pubblicata
      </label>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Salvataggio…" : submitLabel}
      </button>
    </form>
  );
}
