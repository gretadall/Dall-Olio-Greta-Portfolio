"use client";

import { useEditMode } from "./EditModeProvider";

export function EditToolbar() {
  const { isAdmin, editMode, setEditMode, colorPanelOpen, setColorPanelOpen } =
    useEditMode();

  if (!isAdmin) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
      {editMode && (
        <button
          type="button"
          title="Colori"
          onClick={() => setColorPanelOpen(!colorPanelOpen)}
          className={`flex h-11 w-11 items-center justify-center rounded-full border text-lg shadow-lg ${
            colorPanelOpen
              ? "border-primary bg-primary/10"
              : "border-black/[.12] bg-white dark:border-white/[.16] dark:bg-zinc-900"
          }`}
        >
          🎨
        </button>
      )}
      <button
        type="button"
        onClick={() => setEditMode(!editMode)}
        className={`rounded-full px-5 py-3 text-sm font-semibold shadow-lg transition-colors ${
          editMode
            ? "bg-primary text-white"
            : "border border-black/[.12] bg-white text-foreground dark:border-white/[.16] dark:bg-zinc-900"
        }`}
      >
        {editMode ? "Fatto" : "✎ Modifica"}
      </button>
    </div>
  );
}
