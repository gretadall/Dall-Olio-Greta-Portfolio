"use client";

import { useActionState } from "react";
import type { Database } from "@/lib/supabase/types";

type BlogCategory = Database["public"]["Tables"]["blog_categories"]["Row"];
type FormState = { error?: string } | undefined;
type Action = (
  prevState: FormState,
  formData: FormData
) => Promise<FormState>;

export function BlogCategoryForm({
  category,
  action,
  submitLabel,
}: {
  category?: BlogCategory;
  action: Action;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4 max-w-md">
      <label className="flex flex-col gap-1 text-sm">
        Nome
        <input
          name="name"
          required
          defaultValue={category?.name}
          className="rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Slug (lascia vuoto per generarlo dal nome)
        <input
          name="slug"
          defaultValue={category?.slug}
          className="rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Colore badge
        <input
          type="color"
          name="color"
          defaultValue={category?.color ?? "#888888"}
          className="h-11 w-full cursor-pointer rounded-xl border border-line bg-surface p-1"
        />
      </label>

      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-[1.03] disabled:opacity-60"
      >
        {pending ? "Salvataggio…" : submitLabel}
      </button>
    </form>
  );
}
