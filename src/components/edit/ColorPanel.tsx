"use client";

import { useRef } from "react";
import { useEditMode } from "./EditModeProvider";
import {
  updateSiteSettingsField,
  type SiteSettingsColorField,
} from "@/app/edit/actions";

const SWATCHES: {
  field: SiteSettingsColorField;
  cssVar: string | null;
  label: string;
}[] = [
  { field: "primary_color", cssVar: "--primary", label: "Primario" },
  { field: "accent_color", cssVar: "--accent", label: "Accento" },
  { field: "background_color", cssVar: "--background", label: "Sfondo pagina" },
  { field: "font_color", cssVar: "--foreground", label: "Testo" },
  { field: "muted_color", cssVar: "--muted", label: "Testo secondario" },
  { field: "nav_title_color", cssVar: null, label: "Titolo nav" },
];

export function ColorPanel({
  colors,
}: {
  colors: Record<SiteSettingsColorField, string>;
}) {
  const { editMode, colorPanelOpen } = useEditMode();
  const timers = useRef<
    Partial<Record<SiteSettingsColorField, ReturnType<typeof setTimeout>>>
  >({});

  if (!editMode || !colorPanelOpen) return null;

  function handleChange(
    field: SiteSettingsColorField,
    cssVar: string | null,
    value: string
  ) {
    if (cssVar) {
      document.documentElement.style.setProperty(cssVar, value);
    }
    const existing = timers.current[field];
    if (existing) clearTimeout(existing);
    timers.current[field] = setTimeout(() => {
      updateSiteSettingsField(field, value).catch((err) => {
        window.alert(
          err instanceof Error ? err.message : "Errore durante il salvataggio."
        );
      });
    }, 400);
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-3 rounded-2xl border border-black/[.12] bg-white p-4 shadow-lg dark:border-white/[.16] dark:bg-zinc-900">
      {SWATCHES.map(({ field, cssVar, label }) => (
        <label
          key={field}
          className="flex items-center justify-between gap-4 text-sm"
        >
          {label}
          <input
            type="color"
            defaultValue={colors[field]}
            onChange={(e) => handleChange(field, cssVar, e.target.value)}
            className="h-8 w-12 cursor-pointer rounded border border-black/[.12] bg-transparent dark:border-white/[.16]"
          />
        </label>
      ))}
    </div>
  );
}
