"use client";

import Link from "next/link";
import { useEditMode } from "./EditModeProvider";

const roundButton =
  "flex h-11 w-11 items-center justify-center rounded-full border text-lg shadow-lg transition-colors";

export function EditToolbar() {
  const { isAdmin, editMode, setEditMode, colorPanelOpen, setColorPanelOpen } = useEditMode();

  if (!isAdmin) return null;

  return (
    <div className="fixed right-4 bottom-4 z-50 flex items-center gap-2">
      <Link
        href="/admin"
        title="Pannello admin"
        className={`${roundButton} border-line bg-background hover:border-primary`}
      >
        ⚙
      </Link>
      {editMode && (
        <button
          type="button"
          title="Colori"
          onClick={() => setColorPanelOpen(!colorPanelOpen)}
          className={`${roundButton} ${
            colorPanelOpen ? "border-primary bg-primary/15" : "border-line bg-background"
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
            ? "bg-primary text-black"
            : "border border-line bg-background text-foreground hover:border-primary"
        }`}
      >
        {editMode ? "Fatto" : "✎ Modifica"}
      </button>
    </div>
  );
}
