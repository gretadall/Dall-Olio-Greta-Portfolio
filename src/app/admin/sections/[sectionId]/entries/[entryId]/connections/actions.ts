"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type FormState = { error?: string } | undefined;

export async function createConnection(
  fromEntryId: string,
  sectionId: string,
  entryId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const toEntryId = String(formData.get("to_entry_id") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();

  if (!toEntryId) return { error: "Scegli un contenuto da collegare." };
  if (toEntryId === fromEntryId) {
    return { error: "Non puoi collegare un contenuto a se stesso." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("connections").insert({
    from_entry_id: fromEntryId,
    to_entry_id: toEntryId,
    label,
  });

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Questo collegamento con questa etichetta esiste già."
          : "Errore durante la creazione del collegamento.",
    };
  }

  revalidatePath(`/admin/sections/${sectionId}/entries/${entryId}`);
  revalidatePath("/");
}

export async function deleteConnection(
  connectionId: string,
  sectionId: string,
  entryId: string
) {
  const supabase = await createClient();
  await supabase.from("connections").delete().eq("id", connectionId);
  revalidatePath(`/admin/sections/${sectionId}/entries/${entryId}`);
  revalidatePath("/");
}
