"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sanitizeFileName } from "@/lib/supabase/media";

type FormState = { error?: string } | undefined;

export async function uploadEntryMedia(
  entryId: string,
  sectionId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Scegli un file da caricare." };
  }
  if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
    return { error: "Sono ammessi solo immagini o file PDF." };
  }

  try {
    const supabase = await createClient();
    const path = `entries/${entryId}/${Date.now()}-${sanitizeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(path, file);

    if (uploadError) return { error: `Errore durante il caricamento: ${uploadError.message}` };

    const { error } = await supabase
      .from("entry_media")
      .insert({ entry_id: entryId, storage_path: path });

    if (error) return { error: `Errore durante il salvataggio: ${error.message}` };

    revalidatePath(`/admin/sections/${sectionId}/entries/${entryId}`);
    revalidatePath("/");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: `Errore imprevisto durante il caricamento: ${message}` };
  }
}

export async function deleteEntryMedia(
  mediaId: string,
  storagePath: string,
  sectionId: string,
  entryId: string
) {
  const supabase = await createClient();
  await supabase.storage.from("media").remove([storagePath]);
  await supabase.from("entry_media").delete().eq("id", mediaId);
  revalidatePath(`/admin/sections/${sectionId}/entries/${entryId}`);
  revalidatePath("/");
}
