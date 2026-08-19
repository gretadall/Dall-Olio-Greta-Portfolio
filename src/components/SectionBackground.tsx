"use client";

import { useEffect, useState } from "react";
import { getMediaUrl } from "@/lib/supabase/media";

export function SectionBackground({
  imagePath,
}: {
  imagePath: string | null;
}) {
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    setCanHover(query.matches);
    const listener = (e: MediaQueryListEvent) => setCanHover(e.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);

  if (!imagePath) return null;

  return (
    <div
      aria-hidden
      className="inset-0 -z-10"
      style={{
        position: canHover ? "fixed" : "absolute",
        backgroundImage: `url('${getMediaUrl(imagePath)}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: canHover ? "fixed" : "scroll",
      }}
    />
  );
}
