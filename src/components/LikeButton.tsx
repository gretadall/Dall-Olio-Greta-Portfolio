"use client";

import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { toggleLike } from "@/app/[section]/[entry]/actions";

export function LikeButton({
  entryId,
  sectionSlug,
  entrySlug,
  initialLiked,
  initialCount,
  isAuthenticated,
}: {
  entryId: string;
  sectionSlug: string;
  entrySlug: string;
  initialLiked: boolean;
  initialCount: number;
  isAuthenticated: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(
    { liked: initialLiked, count: initialCount },
    (state, liked: boolean) => ({
      liked,
      count: state.count + (liked ? 1 : -1),
    })
  );

  if (!isAuthenticated) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-2 rounded-full border border-black/[.12] px-4 py-2 text-sm text-zinc-600 hover:border-black/[.24] dark:border-white/[.16] dark:text-zinc-400 dark:hover:border-white/[.3]"
      >
        🤍 {initialCount} · accedi per mettere like
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        const nextLiked = !optimistic.liked;
        startTransition(async () => {
          setOptimistic(nextLiked);
          await toggleLike(entryId, sectionSlug, entrySlug);
        });
      }}
      className="inline-flex items-center gap-2 rounded-full border border-black/[.12] px-4 py-2 text-sm transition-colors hover:border-black/[.24] disabled:opacity-60 dark:border-white/[.16] dark:hover:border-white/[.3]"
    >
      {optimistic.liked ? "❤️" : "🤍"} {optimistic.count}
    </button>
  );
}
