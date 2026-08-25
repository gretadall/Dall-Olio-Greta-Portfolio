"use client";

import { useTransition } from "react";
import { useEditMode } from "./EditModeProvider";

export function DeleteButton({
  label,
  action,
  className,
}: {
  label: string;
  action: () => Promise<void> | void;
  className?: string;
}) {
  const { editMode } = useEditMode();
  const [pending, startTransition] = useTransition();

  if (!editMode) return null;

  return (
    <button
      type="button"
      title={`Elimina ${label}`}
      disabled={pending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (
          !window.confirm(`Eliminare "${label}"? L'azione non si può annullare.`)
        )
          return;
        startTransition(async () => {
          await action();
        });
      }}
      className={`${className ?? "absolute right-2 top-2"} z-20 flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-sm font-bold leading-none text-white shadow transition-opacity hover:bg-red-700 disabled:opacity-50`}
    >
      ×
    </button>
  );
}
