"use client";

import { useActionState } from "react";
import type { Database } from "@/lib/supabase/types";
import { updateSiteSettings } from "@/app/admin/settings/actions";
import { hintClass, inputClass, labelClass, primaryButtonClass } from "./ui";

type Settings = Database["public"]["Tables"]["site_settings"]["Row"];

function ColorField({ name, label, value }: { name: string; label: string; value: string }) {
  return (
    <label className={`${labelClass} flex-1`}>
      {label}
      <input
        type="color"
        name={name}
        defaultValue={value}
        className="h-11 w-full cursor-pointer rounded-xl border border-line bg-surface p-1"
      />
    </label>
  );
}

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, formAction, pending] = useActionState(updateSiteSettings, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Titolo del sito
          <input name="site_title" defaultValue={settings.site_title} required className={inputClass} />
          <span className={hintClass}>Appare nella barra in alto e nella scheda del browser.</span>
        </label>
        <label className={labelClass}>
          Il tuo nome
          <input name="owner_name" defaultValue={settings.owner_name ?? ""} className={inputClass} />
          <span className={hintClass}>Quello in rosa nel &quot;Ciao, sono…&quot; della home.</span>
        </label>
      </div>

      <label className={labelClass}>
        Presentazione
        <textarea
          name="tagline"
          rows={3}
          defaultValue={settings.tagline ?? ""}
          className={`${inputClass} resize-none`}
        />
        <span className={hintClass}>
          Le parole dopo il primo punto, separate da virgole, scorrono nella fascia sotto la home.
        </span>
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm">Colori</legend>
        <div className="flex flex-col gap-4 sm:flex-row">
          <ColorField name="primary_color" label="Colore principale" value={settings.primary_color} />
          <ColorField name="background_color" label="Sfondo" value={settings.background_color ?? "#000000"} />
          <ColorField name="font_color" label="Testo" value={settings.font_color ?? "#ffffff"} />
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Email di contatto
          <input
            type="email"
            name="contact_email"
            defaultValue={settings.contact_email ?? ""}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Link LinkedIn
          <input
            type="url"
            name="linkedin_url"
            defaultValue={settings.linkedin_url ?? ""}
            className={inputClass}
          />
        </label>
      </div>

      <label className={labelClass}>
        Testo del footer
        <input name="footer_text" defaultValue={settings.footer_text ?? ""} required className={inputClass} />
      </label>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "Salvataggio…" : "Salva impostazioni"}
      </button>
    </form>
  );
}
