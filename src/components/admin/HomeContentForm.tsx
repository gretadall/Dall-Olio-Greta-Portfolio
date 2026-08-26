"use client";

import { useActionState } from "react";
import Link from "next/link";
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

      <label className="flex flex-col gap-1 text-sm">
        Icona Vision (emoji, opzionale)
        <input
          name="vision_icon"
          defaultValue={settings.vision_icon ?? ""}
          placeholder="✨"
          className="rounded-lg border border-black/[.12] bg-transparent px-4 py-2 text-sm outline-none focus:border-black/[.3] dark:border-white/[.16] dark:focus:border-white/[.4]"
        />
      </label>

      <div className="flex flex-col gap-1 rounded-lg border border-black/[.08] p-4 text-sm dark:border-white/[.145]">
        <span>Valori</span>
        <p className="text-zinc-500 dark:text-zinc-400">
          I singoli valori (titolo + approfondimento) si gestiscono ora come
          contenuti della sezione &quot;Valori&quot; in{" "}
          <Link href="/admin/sections" className="text-primary hover:underline">
            Sezioni
          </Link>
          .
        </p>
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
