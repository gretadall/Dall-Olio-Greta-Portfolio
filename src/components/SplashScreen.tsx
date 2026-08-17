"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const SPLASH_DURATION_MS = 3000;
const FADE_DURATION_MS = 300;

export function SplashScreen({
  imageUrl,
  title,
  message,
}: {
  imageUrl: string | null;
  title: string | null;
  message: string | null;
}) {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const fadeTimer = setTimeout(
      () => setFading(true),
      SPLASH_DURATION_MS - FADE_DURATION_MS
    );
    const hideTimer = setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = "";
    }, SPLASH_DURATION_MS);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
      document.body.style.overflow = "";
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background px-6 text-center transition-opacity duration-300"
      style={{ opacity: fading ? 0 : 1 }}
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt=""
          width={160}
          height={160}
          priority
          className="max-h-40 w-auto object-contain"
        />
      )}
      {title && (
        <p className="text-xl font-semibold tracking-tight text-foreground">
          {title}
        </p>
      )}
      {message && <p className="max-w-sm text-sm text-muted">{message}</p>}
    </div>
  );
}
