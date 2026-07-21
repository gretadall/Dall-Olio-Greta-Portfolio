"use client";

import { useOptimistic, useTransition } from "react";
import { toggleFollow } from "@/app/actions";

export function FollowButton({ initialFollowing }: { initialFollowing: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [following, setFollowing] = useOptimistic(
    initialFollowing,
    (_state, next: boolean) => next
  );

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        const next = !following;
        startTransition(async () => {
          setFollowing(next);
          await toggleFollow();
        });
      }}
      className={
        following
          ? "text-sm font-medium text-accent disabled:opacity-60"
          : "text-sm text-zinc-500 hover:text-zinc-700 disabled:opacity-60 dark:text-zinc-400 dark:hover:text-zinc-200"
      }
    >
      {following ? "Iscritta ✓" : "Iscriviti"}
    </button>
  );
}
