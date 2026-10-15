"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Database } from "@/lib/supabase/types";
import { RichBodyEditor } from "@/components/admin/RichBodyEditor";
import { updateHomeContent } from "@/app/admin/settings/actions";
import { hintClass, labelClass, primaryButtonClass } from "./ui";

type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];

export function HomeContentForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState(updateHomeContent, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <label className={labelClass}>
        Vision
        <RichBodyEditor
          entryId="vision"
          mediaPathPrefix="site-settings"
          fieldName="vision_text"
          initialContent={settings.vision_text ?? ""}
        />
        <span className={hintClass}>
          Il testo accanto ai valori in home. I valori stessi sono i contenuti della sezione
          &quot;Valori&quot; in{" "}
          <Link href="/admin/sections" className="text-primary hover:underline">
            Sezioni
          </Link>
          .
        </span>
      </label>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "Salvataggio…" : "Salva vision"}
      </button>
    </form>
  );
}
