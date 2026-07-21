"use client";

import { useActionState } from "react";

type FormState = { error?: string } | undefined;
type Action = (
  prevState: FormState,
  formData: FormData
) => Promise<FormState>;

export function PhotoUploadForm({
  action,
  submitLabel,
}: {
  action: Action;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3 max-w-md">
      <input
        type="file"
        name="photo"
        accept="image/*"
        required
        className="text-sm"
      />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg border border-black/[.12] px-4 py-2 text-sm font-medium disabled:opacity-60 dark:border-white/[.16]"
      >
        {pending ? "Caricamento…" : submitLabel}
      </button>
    </form>
  );
}
