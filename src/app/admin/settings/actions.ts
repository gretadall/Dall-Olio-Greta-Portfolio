"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const FONT_CHOICES = ["geist", "inter", "playfair", "space-mono"] as const;

type FormState = { error?: string } | undefined;

export async function updateSiteSettings(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const siteTitle = String(formData.get("site_title") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim();
  const ownerName = String(formData.get("owner_name") ?? "").trim();
  const primaryColor = String(formData.get("primary_color") ?? "").trim();
  const accentColor = String(formData.get("accent_color") ?? "").trim();
  const backgroundColor = String(formData.get("background_color") ?? "").trim();
  const fontChoice = String(formData.get("font_choice") ?? "").trim();
  const linkedinUrl = String(formData.get("linkedin_url") ?? "").trim();

  if (!siteTitle) return { error: "Il titolo del sito è obbligatorio." };
  if (!FONT_CHOICES.includes(fontChoice as (typeof FONT_CHOICES)[number])) {
    return { error: "Font non valido." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .update({
      site_title: siteTitle,
      tagline: tagline || null,
      owner_name: ownerName || null,
      primary_color: primaryColor,
      accent_color: accentColor,
      background_color: backgroundColor || null,
      font_choice: fontChoice,
      linkedin_url: linkedinUrl || null,
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

  const supabase = await createClient();
  const path = `hero/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("media")
    .upload(path, file, { upsert: true });

  if (uploadError) return { error: "Errore durante il caricamento della foto." };

  const { error } = await supabase
    .from("site_settings")
    .update({ hero_photo_path: path, updated_at: new Date().toISOString() })
    .eq("id", true);

  if (error) return { error: "Errore durante il salvataggio della foto." };

  revalidatePath("/", "layout");
}
