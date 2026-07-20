"use client";

import { useActionState } from "react";
import { postComment } from "@/app/[section]/[entry]/actions";

export function CommentForm({
  entryId,
  sectionSlug,
  entrySlug,
}: {
  entryId: string;
  sectionSlug: string;
  entrySlug: string;
}) {
  const action = postComment.bind(null, entryId, sectionSlug, entrySlug);
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <textarea
        name="body"
        required
        rows={3}
        placeholder="Scrivi un commento…"
        className="resize-none rounded-lg border border-black/[.12] bg-transparent px-4 py-2 text-sm outline-none focus:border-black/[.3] dark:border-white/[.16] dark:focus:border-white/[.4]"
      />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-60"
      >
        {pending ? "Invio…" : "Commenta"}
      </button>
    </form>
  );
}
