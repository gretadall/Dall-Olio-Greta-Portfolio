"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type FormState = { error?: string } | undefined;

export async function uploadEntryMedia(
  entryId: string,
  sectionId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Scegli un'immagine da caricare." };
  }

  const supabase = await createClient();
  const path = `entries/${entryId}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("media")
    .upload(path, file);

  if (uploadError) return { error: "Errore durante il caricamento della foto." };

  const { error } = await supabase
    .from("entry_media")
    .insert({ entry_id: entryId, storage_path: path });

  if (error) return { error: "Errore durante il salvataggio della foto." };

  revalidatePath(`/admin/sections/${sectionId}/entries/${entryId}`);
  revalidatePath("/");
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
