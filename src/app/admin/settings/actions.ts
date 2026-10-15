"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sanitizeFileName } from "@/lib/supabase/media";
import { sanitizeEntryBody } from "@/lib/sanitize";

type FormState = { error?: string } | undefined;

function describeError(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  return { error: `Errore imprevisto durante il caricamento: ${message}` };
}

export async function updateSiteSettings(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const siteTitle = String(formData.get("site_title") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim();
  const ownerName = String(formData.get("owner_name") ?? "").trim();
  const primaryColor = String(formData.get("primary_color") ?? "").trim();
  const backgroundColor = String(formData.get("background_color") ?? "").trim();
  const fontColor = String(formData.get("font_color") ?? "").trim();
  const linkedinUrl = String(formData.get("linkedin_url") ?? "").trim();
  const contactEmail = String(formData.get("contact_email") ?? "").trim();
  const footerText = String(formData.get("footer_text") ?? "").trim();

  if (!siteTitle) return { error: "Il titolo del sito è obbligatorio." };
  if (!primaryColor) return { error: "Il colore principale è obbligatorio." };
  if (!footerText) return { error: "Il testo del footer non può essere vuoto." };

  // Only the settings the site still uses; older columns are left untouched.
  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .update({
      site_title: siteTitle,
      tagline: tagline || null,
      owner_name: ownerName || null,
      primary_color: primaryColor,
      background_color: backgroundColor || null,
      font_color: fontColor || null,
      linkedin_url: linkedinUrl || null,
      contact_email: contactEmail || null,
      footer_text: footerText,
      updated_at: new Date().toISOString(),
    })
    .eq("id", true);

  if (error) return { error: "Errore durante il salvataggio." };

  revalidatePath("/", "layout");
}

export async function updateHomeContent(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const visionText = String(formData.get("vision_text") ?? "").trim();

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .update({
      vision_text: visionText ? sanitizeEntryBody(visionText) : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", true);

  if (error) return { error: "Errore durante il salvataggio." };

  revalidatePath("/", "layout");
}

export async function uploadHeroPhoto(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Scegli un'immagine da caricare." };
  }

  try {
    const supabase = await createClient();
    const path = `hero/${Date.now()}-${sanitizeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(path, file, { upsert: true });

    if (uploadError) return { error: `Errore durante il caricamento: ${uploadError.message}` };

    const { error } = await supabase
      .from("site_settings")
      .update({ hero_photo_path: path, updated_at: new Date().toISOString() })
      .eq("id", true);

    if (error) return { error: `Errore durante il salvataggio: ${error.message}` };

    revalidatePath("/", "layout");
  } catch (err) {
    return describeError(err);
  }
}
