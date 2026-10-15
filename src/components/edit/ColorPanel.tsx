"use client";

import { useRef } from "react";
import { useEditMode } from "./EditModeProvider";
import { updateSiteSettingsField, type SiteSettingsColorField } from "@/app/edit/actions";

// The three colors the site is built on; everything else is derived from them.
const SWATCHES: { field: SiteSettingsColorField; cssVar: string; label: string }[] = [
  { field: "primary_color", cssVar: "--primary", label: "Principale" },
  { field: "background_color", cssVar: "--background", label: "Sfondo" },
  { field: "font_color", cssVar: "--foreground", label: "Testo" },
];

export function ColorPanel({ colors }: { colors: Partial<Record<SiteSettingsColorField, string>> }) {
  const { editMode, colorPanelOpen } = useEditMode();
  const timers = useRef<Partial<Record<SiteSettingsColorField, ReturnType<typeof setTimeout>>>>({});

  if (!editMode || !colorPanelOpen) return null;

  function handleChange(field: SiteSettingsColorField, cssVar: string, value: string) {
    document.documentElement.style.setProperty(cssVar, value);
    const existing = timers.current[field];
    if (existing) clearTimeout(existing);
    timers.current[field] = setTimeout(() => {
      updateSiteSettingsField(field, value).catch((err) => {
        window.alert(err instanceof Error ? err.message : "Errore durante il salvataggio.");
      });
    }, 400);
  }

  return (
    <div className="fixed right-4 bottom-20 z-50 flex flex-col gap-3 rounded-2xl border border-line bg-background p-4 shadow-2xl">
      {SWATCHES.map(({ field, cssVar, label }) => (
        <label key={field} className="flex items-center justify-between gap-6 text-sm">
          {label}
          <input
            type="color"
            defaultValue={colors[field]}
            onChange={(e) => handleChange(field, cssVar, e.target.value)}
            className="h-8 w-12 cursor-pointer rounded-lg border border-line bg-transparent"
          />
        </label>
      ))}
    </div>
  );
}
