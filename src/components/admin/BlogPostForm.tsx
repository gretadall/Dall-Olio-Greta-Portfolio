"use client";

import { useActionState } from "react";
import type { Database } from "@/lib/supabase/types";
import { RichBodyEditor } from "@/components/admin/RichBodyEditor";

type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"];
type BlogCategory = Database["public"]["Tables"]["blog_categories"]["Row"];
type FormState = { error?: string } | undefined;
type Action = (
  prevState: FormState,
  formData: FormData
) => Promise<FormState>;

function toDateInputValue(value: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

export function BlogPostForm({
  post,
  categories,
  action,
  submitLabel,
}: {
  post?: BlogPost;
  categories: BlogCategory[];
  action: Action;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4 max-w-md">
      <label className="flex flex-col gap-1 text-sm">
        Titolo
        <input
          name="title"
          required
          defaultValue={post?.title}
          className="rounded-lg border border-black/[.12] bg-transparent px-4 py-2 text-sm outline-none focus:border-black/[.3] dark:border-white/[.16] dark:focus:border-white/[.4]"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Slug (lascia vuoto per generarlo dal titolo)
        <input
          name="slug"
          defaultValue={post?.slug}
          className="rounded-lg border border-black/[.12] bg-transparent px-4 py-2 text-sm outline-none focus:border-black/[.3] dark:border-white/[.16] dark:focus:border-white/[.4]"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Categoria
        <select
          name="category_id"
          defaultValue={post?.category_id ?? ""}
          className="rounded-lg border border-black/[.12] bg-transparent px-4 py-2 text-sm outline-none focus:border-black/[.3] dark:border-white/[.16] dark:focus:border-white/[.4]"
        >
          <option value="">Nessuna categoria</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Estratto (2-3 righe, mostrato nell&apos;elenco)
        <textarea
          name="excerpt"
          rows={3}
          defaultValue={post?.excerpt ?? ""}
          className="resize-none rounded-lg border border-black/[.12] bg-transparent px-4 py-2 text-sm outline-none focus:border-black/[.3] dark:border-white/[.16] dark:focus:border-white/[.4]"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Data di pubblicazione (lascia vuoto per usare la data odierna)
        <input
          type="date"
          name="published_at"
          defaultValue={toDateInputValue(post?.published_at ?? null)}
          className="rounded-lg border border-black/[.12] bg-transparent px-4 py-2 text-sm outline-none focus:border-black/[.3] dark:border-white/[.16] dark:focus:border-white/[.4]"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Testo completo
        {post ? (
          <RichBodyEditor
            entryId={post.id}
            mediaPathPrefix="blog-posts"
            initialContent={post.body ?? ""}
          />
        ) : (
          <>
            <textarea
              name="body"
              rows={6}
              className="resize-none rounded-lg border border-black/[.12] bg-transparent px-4 py-2 text-sm outline-none focus:border-black/[.3] dark:border-white/[.16] dark:focus:border-white/[.4]"
            />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Dopo aver creato l&apos;articolo potrai formattarlo con
              l&apos;editor completo e aggiungere foto/video direttamente nel
              testo.
            </span>
          </>
        )}
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="is_published"
          defaultChecked={post?.is_published ?? true}
        />
        Pubblicato
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
