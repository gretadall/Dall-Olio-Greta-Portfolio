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
  const [heroOverlayDarkness, setHeroOverlayDarkness] = useState(
    settings.hero_overlay_darkness ?? 55
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
        Scurità sfondo &quot;Chi sono&quot; ({heroOverlayDarkness}%)
        <input
          type="range"
          name="hero_overlay_darkness"
          min={0}
          max={100}
          value={heroOverlayDarkness}
          onChange={(e) => setHeroOverlayDarkness(Number(e.target.value))}
        />
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          L&apos;alone scuro dietro al testo, se carichi una foto di sfondo
          per il blocco &quot;Chi sono&quot; qui sotto.
        </span>
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="splash_enabled"
          defaultChecked={settings.splash_enabled}
        />
        Mostra una pagina di anteprima all&apos;apertura del sito
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Durata pagina di anteprima (secondi)
        <input
          type="number"
          name="splash_duration_seconds"
          min={1}
          max={15}
          step={0.5}
          defaultValue={settings.splash_duration_seconds ?? 3}
          className="rounded-lg border border-black/[.12] bg-transparent px-4 py-2 text-sm outline-none focus:border-black/[.3] dark:border-white/[.16] dark:focus:border-white/[.4]"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Titolo anteprima
        <input
          name="splash_title"
          defaultValue={settings.splash_title ?? ""}
          placeholder="es. Sto per mostrarti qualcosa…"
          className="rounded-lg border border-black/[.12] bg-transparent px-4 py-2 text-sm outline-none focus:border-black/[.3] dark:border-white/[.16] dark:focus:border-white/[.4]"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Messaggio anteprima
        <textarea
          name="splash_message"
          rows={2}
          defaultValue={settings.splash_message ?? ""}
          className="resize-none rounded-lg border border-black/[.12] bg-transparent px-4 py-2 text-sm outline-none focus:border-black/[.3] dark:border-white/[.16] dark:focus:border-white/[.4]"
        />
      </label>

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

      <div className="flex gap-4">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Testo bottone &quot;Chi sono&quot;
          <input
            name="nav_home_label"
            defaultValue={settings.nav_home_label ?? "Chi sono"}
            className="rounded-lg border border-black/[.12] bg-transparent px-4 py-2 text-sm outline-none focus:border-black/[.3] dark:border-white/[.16] dark:focus:border-white/[.4]"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Testo bottone &quot;Rete&quot;
          <input
            name="nav_rete_label"
            defaultValue={settings.nav_rete_label ?? "Rete"}
            className="rounded-lg border border-black/[.12] bg-transparent px-4 py-2 text-sm outline-none focus:border-black/[.3] dark:border-white/[.16] dark:focus:border-white/[.4]"
          />
        </label>
      </div>

      <div className="flex gap-4">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Testo bottone LinkedIn
          <input
            name="linkedin_label"
            defaultValue={settings.linkedin_label ?? "LinkedIn"}
            className="rounded-lg border border-black/[.12] bg-transparent px-4 py-2 text-sm outline-none focus:border-black/[.3] dark:border-white/[.16] dark:focus:border-white/[.4]"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          Testo bottone email di contatto
          <input
            name="contact_button_label"
            defaultValue={settings.contact_button_label ?? "Scrivimi"}
            className="rounded-lg border border-black/[.12] bg-transparent px-4 py-2 text-sm outline-none focus:border-black/[.3] dark:border-white/[.16] dark:focus:border-white/[.4]"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Testo del footer
        <input
          name="footer_text"
          defaultValue={settings.footer_text ?? "Built by Greta dall'Olio"}
          className="rounded-lg border border-black/[.12] bg-transparent px-4 py-2 text-sm outline-none focus:border-black/[.3] dark:border-white/[.16] dark:focus:border-white/[.4]"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Email di contatto (per il pulsante &quot;Scrivimi&quot; in alto)
        <input
          type="email"
          name="contact_email"
          defaultValue={settings.contact_email ?? ""}
          placeholder="tuoindirizzo@email.com"
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
