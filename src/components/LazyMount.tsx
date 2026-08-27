"use client";

import { useEffect, useRef, useState } from "react";

// Defers mounting (and any data-fetching/heavy init) of `children` until the
// wrapper scrolls near the viewport, instead of doing that work immediately
// on page load regardless of scroll position.
export function LazyMount({
  children,
  placeholderClassName,
}: {
  children: React.ReactNode;
  placeholderClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!visible) {
    return <div ref={ref} className={placeholderClassName} />;
  }

  return <div ref={ref}>{children}</div>;
}
