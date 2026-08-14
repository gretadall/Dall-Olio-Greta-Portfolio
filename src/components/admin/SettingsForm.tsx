"use client";

import { useActionState, useState } from "react";
import type { Database } from "@/lib/supabase/types";
import { updateSiteSettings } from "@/app/admin/settings/actions";

type Settings = Database["public"]["Tables"]["site_settings"]["Row"];

const FONT_OPTIONS = [
  { value: "geist", label: "Geist (predefinito)" },
  { value: "inter", label: "Inter" },
  { value: "playfair", label: "Playfair Display" },
  { value: "space-mono", label: "Space Mono" },
];

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, formAction, pending] = useActionState(
    updateSiteSettings,
    undefined
  );
  const [heroPhotoSize, setHeroPhotoSize] = useState(
    settings.hero_photo_size ?? 96
  );

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4 max-w-md">
      <label className="flex flex-col gap-1 text-sm">
        Titolo del sito
        <input
          name="site_title"
          required
          defaultValue={settings.site_title}
          className="rounded-lg border border-black/[.12] bg-transparent px-4 py-2 text-sm outline-none focus:border-black/[.3] dark:border-white/[.16] dark:focus:border-white/[.4]"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Il tuo nome (mostrato in home: &quot;Ciao, sono ___&quot;)
        <input
          name="owner_name"
          defaultValue={settings.owner_name ?? ""}
          className="rounded-lg border border-black/[.12] bg-transparent px-4 py-2 text-sm outline-none focus:border-black/[.3] dark:border-white/[.16] dark:focus:border-white/[.4]"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Tagline (sottotitolo in home)
        <textarea
          name="tagline"
          rows={2}
          defaultValue={settings.tagline ?? ""}
          className="resize-none rounded-lg border border-black/[.12] bg-transparent px-4 py-2 text-sm outline-none focus:border-black/[.3] dark:border-white/[.16] dark:focus:border-white/[.4]"
        />
      </label>

      <div className="flex gap-4">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Colore primario
          <input
            type="color"
            name="primary_color"
            defaultValue={settings.primary_color}
            className="h-10 w-full rounded-lg border border-black/[.12] bg-transparent dark:border-white/[.16]"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Colore accento
          <input
            type="color"
            name="accent_color"
            defaultValue={settings.accent_color}
            className="h-10 w-full rounded-lg border border-black/[.12] bg-transparent dark:border-white/[.16]"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Colore sfondo pagina
          <input
            type="color"
            name="background_color"
            defaultValue={settings.background_color ?? "#ffffff"}
            className="h-10 w-full rounded-lg border border-black/[.12] bg-transparent dark:border-white/[.16]"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Colore testo
          <input
            type="color"
            name="font_color"
            defaultValue={settings.font_color ?? "#171717"}
            className="h-10 w-full rounded-lg border border-black/[.12] bg-transparent dark:border-white/[.16]"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Colore descrizioni
          <input
            type="color"
            name="muted_color"
            defaultValue={settings.muted_color ?? "#52525b"}
            className="h-10 w-full rounded-lg border border-black/[.12] bg-transparent dark:border-white/[.16]"
          />
        </label>
      </div>

      <div className="flex gap-4">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Grandezza foto profilo ({heroPhotoSize}px)
          <input
            type="range"
            name="hero_photo_size"
            min={32}
            max={320}
            defaultValue={settings.hero_photo_size ?? 96}
            onChange={(e) => setHeroPhotoSize(Number(e.target.value))}
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Forma foto profilo
          <select
            name="hero_photo_radius"
            defaultValue={String(settings.hero_photo_radius ?? 50)}
            className="rounded-lg border border-black/[.12] bg-transparent px-4 py-2 text-sm outline-none focus:border-black/[.3] dark:border-white/[.16] dark:focus:border-white/[.4]"
          >
            <option value="50">Cerchio</option>
            <option value="16">Angoli arrotondati</option>
            <option value="0">Quadrata</option>
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Link LinkedIn (per il pulsante in alto)
        <input
          type="url"
          name="linkedin_url"
          defaultValue={settings.linkedin_url ?? ""}
          placeholder="https://www.linkedin.com/in/tuoprofilo"
          className="rounded-lg border border-black/[.12] bg-transparent px-4 py-2 text-sm outline-none focus:border-black/[.3] dark:border-white/[.16] dark:focus:border-white/[.4]"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Font
        <select
          name="font_choice"
          defaultValue={settings.font_choice}
          className="rounded-lg border border-black/[.12] bg-transparent px-4 py-2 text-sm outline-none focus:border-black/[.3] dark:border-white/[.16] dark:focus:border-white/[.4]"
        >
          {FONT_OPTIONS.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
      </label>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Salvataggio…" : "Salva impostazioni"}
      </button>
    </form>
  );
}
