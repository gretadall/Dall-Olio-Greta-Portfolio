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
          className="rounded-lg border border-black/[.12] bg-transparent px-4 py-2 text-sm outline-none focus:border-black/[.3] dark:border-white/[.16] dark:focus:border-white/[.4]"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Slug (lascia vuoto per generarlo dal nome)
        <input
          name="slug"
          defaultValue={category?.slug}
          className="rounded-lg border border-black/[.12] bg-transparent px-4 py-2 text-sm outline-none focus:border-black/[.3] dark:border-white/[.16] dark:focus:border-white/[.4]"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Colore badge
        <input
          type="color"
          name="color"
          defaultValue={category?.color ?? "#888888"}
          className="h-10 w-full rounded-lg border border-black/[.12] bg-transparent dark:border-white/[.16]"
        />
      </label>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Salvataggio…" : submitLabel}
      </button>
    </form>
  );
}
