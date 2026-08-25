"use client";

import { useActionState } from "react";
import type { Database } from "@/lib/supabase/types";
import { RichBodyEditor } from "@/components/admin/RichBodyEditor";
import { updateHomeContent } from "@/app/admin/settings/actions";

type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];

export function HomeContentForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState(updateHomeContent, undefined);

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-8 max-w-md">
      <label className="flex flex-col gap-1 text-sm">
        Vision
        <RichBodyEditor
          entryId="vision"
          mediaPathPrefix="site-settings"
          fieldName="vision_text"
          initialContent={settings.vision_text ?? ""}
        />
      </label>

      <div className="flex flex-col gap-3">
        <span className="text-sm">Valori</span>
        <label className="flex flex-col gap-1 text-sm">
          Testo introduttivo (sempre visibile)
          <textarea
            name="valori_intro"
            rows={2}
            defaultValue={settings.valori_intro ?? ""}
            className="resize-none rounded-lg border border-black/[.12] bg-transparent px-4 py-2 text-sm outline-none focus:border-black/[.3] dark:border-white/[.16] dark:focus:border-white/[.4]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Testo esteso (dietro la freccina)
          <RichBodyEditor
            entryId="valori"
            mediaPathPrefix="site-settings"
            fieldName="valori_body"
            initialContent={settings.valori_body ?? ""}
          />
        </label>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-sm">Formazione</span>
        <label className="flex flex-col gap-1 text-sm">
          Testo introduttivo (sempre visibile)
          <textarea
            name="formazione_intro"
            rows={2}
            defaultValue={settings.formazione_intro ?? ""}
            className="resize-none rounded-lg border border-black/[.12] bg-transparent px-4 py-2 text-sm outline-none focus:border-black/[.3] dark:border-white/[.16] dark:focus:border-white/[.4]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Percorso formativo e lingue straniere (dietro la freccina)
          <RichBodyEditor
            entryId="formazione"
            mediaPathPrefix="site-settings"
            fieldName="formazione_body"
            initialContent={settings.formazione_body ?? ""}
          />
        </label>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Salvataggio…" : "Salva contenuti home"}
      </button>
    </form>
  );
}
