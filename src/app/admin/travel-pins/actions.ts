"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sanitizeFileName } from "@/lib/supabase/media";

type FormState = { error?: string } | undefined;

function readPinForm(formData: FormData) {
  const label = String(formData.get("label") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const lat = Number(formData.get("lat"));
  const lng = Number(formData.get("lng"));
  const entryId = String(formData.get("entry_id") ?? "").trim();
  const isPublished = formData.get("is_published") === "on";

  return { label, country, lat, lng, entryId, isPublished };
}

export async function createTravelPin(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const { label, country, lat, lng, entryId, isPublished } =
    readPinForm(formData);

  if (!label) return { error: "Il nome del luogo è obbligatorio." };
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    return { error: "Latitudine non valida (tra -90 e 90)." };
  }
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    return { error: "Longitudine non valida (tra -180 e 180)." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("travel_pins").insert({
    label,
    country: country || null,
    lat,
    lng,
    entry_id: entryId || null,
    is_published: isPublished,
  });

  if (error) return { error: "Errore durante la creazione." };

  revalidatePath("/admin/travel-pins");
  revalidatePath("/");
  revalidatePath("/viaggi");
  redirect("/admin/travel-pins");
}

export async function updateTravelPin(
  pinId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const { label, country, lat, lng, entryId, isPublished } =
    readPinForm(formData);

  if (!label) return { error: "Il nome del luogo è obbligatorio." };
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    return { error: "Latitudine non valida (tra -90 e 90)." };
  }
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    return { error: "Longitudine non valida (tra -180 e 180)." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("travel_pins")
    .update({
      label,
      country: country || null,
      lat,
      lng,
      entry_id: entryId || null,
      is_published: isPublished,
      updated_at: new Date().toISOString(),
    })
    .eq("id", pinId);

  if (error) return { error: "Errore durante il salvataggio." };

  revalidatePath("/admin/travel-pins");
  revalidatePath("/");
  revalidatePath("/viaggi");
  redirect("/admin/travel-pins");
}

export async function deleteTravelPin(pinId: string) {
  const supabase = await createClient();
  await supabase.from("travel_pins").delete().eq("id", pinId);
  revalidatePath("/admin/travel-pins");
  revalidatePath("/");
  revalidatePath("/viaggi");
}

export async function uploadTravelPinPhoto(
  pinId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Scegli un'immagine da caricare." };
  }

  try {
    const supabase = await createClient();
    const path = `travel-pins/${pinId}/${Date.now()}-${sanitizeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(path, file, { upsert: true });

    if (uploadError) return { error: `Errore durante il caricamento: ${uploadError.message}` };

    const { error } = await supabase
      .from("travel_pins")
      .update({ photo_path: path, updated_at: new Date().toISOString() })
      .eq("id", pinId);

    if (error) return { error: `Errore durante il salvataggio: ${error.message}` };

    revalidatePath(`/admin/travel-pins/${pinId}`);
    revalidatePath("/");
    revalidatePath("/viaggi");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: `Errore imprevisto durante il caricamento: ${message}` };
  }
}

export async function removeTravelPinPhoto(pinId: string) {
  const supabase = await createClient();
  await supabase
    .from("travel_pins")
    .update({ photo_path: null, updated_at: new Date().toISOString() })
    .eq("id", pinId);

  revalidatePath(`/admin/travel-pins/${pinId}`);
  revalidatePath("/");
  revalidatePath("/viaggi");
}

export async function reorderTravelPins(orderedIds: string[]) {
  const supabase = await createClient();
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("travel_pins").update({ sort_order: index }).eq("id", id)
    )
  );

  revalidatePath("/admin/travel-pins");
  revalidatePath("/");
  revalidatePath("/viaggi");
}
