"use client";

import { useState } from "react";

// Defers mounting (and any data-fetching/heavy init) of `children` until the
// visitor clicks to load it — a click is always reliable, unlike viewport
// detection (IntersectionObserver never fired reliably here in practice).
export function LazyMount({
  children,
  label,
  icon,
}: {
  children: React.ReactNode;
  label: string;
  icon?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  if (loaded) return <>{children}</>;

  return (
    <button
      type="button"
      onClick={() => setLoaded(true)}
      className="flex h-[340px] w-[340px] max-w-full flex-col items-center justify-center gap-2 rounded-full border border-dashed border-black/[.16] text-sm font-medium text-primary transition-colors hover:border-primary/50 dark:border-white/[.2]"
    >
      {icon && <span className="text-3xl">{icon}</span>}
      {label}
    </button>
  );
}
