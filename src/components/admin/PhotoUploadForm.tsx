"use client";

import { useActionState, useState } from "react";

type FormState = { error?: string } | undefined;
type Action = (
  prevState: FormState,
  formData: FormData
) => Promise<FormState>;

const MAX_DIMENSION = 2000;
const JPEG_QUALITY = 0.85;

async function compressImage(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    if (!blob || blob.size >= file.size) return file;

    const newName = file.name.replace(/\.\w+$/, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } catch {
    // Unsupported format (e.g. some HEIC variants) or decoding failure:
    // fall back to uploading the original file untouched.
    return file;
  }
}

export function PhotoUploadForm({
  action,
  submitLabel,
  accept = "image/*",
}: {
  action: Action;
  submitLabel: string;
  accept?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [processing, setProcessing] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("photo") as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) return;

    setProcessing(true);
    const uploadFile = file.type.startsWith("image/")
      ? await compressImage(file)
      : file;
    setProcessing(false);

    const formData = new FormData();
    formData.set("photo", uploadFile);
    formAction(formData);
  }

  const busy = pending || processing;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md">
      <input
        type="file"
        name="photo"
        accept={accept}
        required
        className="text-sm"
      />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="self-start rounded-lg border border-black/[.12] px-4 py-2 text-sm font-medium disabled:opacity-60 dark:border-white/[.16]"
      >
        {busy ? "Caricamento…" : submitLabel}
      </button>
    </form>
  );
}
