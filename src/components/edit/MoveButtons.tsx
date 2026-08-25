"use client";

import { useEditMode } from "./EditModeProvider";

export function MoveButtons({
  onUp,
  onDown,
  disabledUp,
  disabledDown,
}: {
  onUp: () => void;
  onDown: () => void;
  disabledUp?: boolean;
  disabledDown?: boolean;
}) {
  const { editMode } = useEditMode();

  if (!editMode) return null;

  return (
    <div className="absolute left-2 top-2 z-20 flex flex-col gap-1">
      <button
        type="button"
        title="Sposta su"
        disabled={disabledUp}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onUp();
        }}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-black/[.12] bg-white text-sm shadow disabled:opacity-30 dark:border-white/[.16] dark:bg-zinc-900"
      >
        ▲
      </button>
      <button
        type="button"
        title="Sposta giù"
        disabled={disabledDown}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDown();
        }}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-black/[.12] bg-white text-sm shadow disabled:opacity-30 dark:border-white/[.16] dark:bg-zinc-900"
      >
        ▼
      </button>
    </div>
  );
}
