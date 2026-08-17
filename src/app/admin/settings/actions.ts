"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sanitizeFileName } from "@/lib/supabase/media";

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
  const fontColor = String(formData.get("font_color") ?? "").trim();
  const mutedColor = String(formData.get("muted_color") ?? "").trim();
  const fontChoice = String(formData.get("font_choice") ?? "").trim();
  const linkedinUrl = String(formData.get("linkedin_url") ?? "").trim();
  const heroPhotoSize = Number(formData.get("hero_photo_size") ?? 96);
  const heroPhotoRadius = Number(formData.get("hero_photo_radius") ?? 50);
  const splashEnabled = formData.get("splash_enabled") === "on";
  const splashTitle = String(formData.get("splash_title") ?? "").trim();
  const splashMessage = String(formData.get("splash_message") ?? "").trim();

  if (!siteTitle) return { error: "Il titolo del sito è obbligatorio." };
  if (!FONT_CHOICES.includes(fontChoice as (typeof FONT_CHOICES)[number])) {
    return { error: "Font non valido." };
  }
  if (!Number.isFinite(heroPhotoSize) || heroPhotoSize < 32 || heroPhotoSize > 320) {
    return { error: "Grandezza foto profilo non valida." };
  }
  if (!Number.isFinite(heroPhotoRadius) || heroPhotoRadius < 0 || heroPhotoRadius > 50) {
    return { error: "Forma foto profilo non valida." };
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
      font_color: fontColor || null,
      muted_color: mutedColor || null,
      font_choice: fontChoice,
      linkedin_url: linkedinUrl || null,
      hero_photo_size: heroPhotoSize,
      hero_photo_radius: heroPhotoRadius,
      splash_enabled: splashEnabled,
      splash_title: splashTitle || null,
      splash_message: splashMessage || null,
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
  const path = `hero/${Date.now()}-${sanitizeFileName(file.name)}`;
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

export async function uploadBackgroundImage(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Scegli un'immagine da caricare." };
  }

  const supabase = await createClient();
  const path = `background/${Date.now()}-${sanitizeFileName(file.name)}`;
  const { error: uploadError } = await supabase.storage
    .from("media")
    .upload(path, file, { upsert: true });

  if (uploadError) return { error: "Errore durante il caricamento dell'immagine." };

  const { error } = await supabase
    .from("site_settings")
    .update({ background_image_path: path, updated_at: new Date().toISOString() })
    .eq("id", true);

  if (error) return { error: "Errore durante il salvataggio dell'immagine." };

  revalidatePath("/", "layout");
}

export async function removeBackgroundImage() {
  const supabase = await createClient();
  await supabase
    .from("site_settings")
    .update({ background_image_path: null, updated_at: new Date().toISOString() })
    .eq("id", true);

  revalidatePath("/", "layout");
}

export async function uploadSplashImage(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Scegli un'immagine da caricare." };
  }

  const supabase = await createClient();
  const path = `splash/${Date.now()}-${sanitizeFileName(file.name)}`;
  const { error: uploadError } = await supabase.storage
    .from("media")
    .upload(path, file, { upsert: true });

  if (uploadError) return { error: "Errore durante il caricamento dell'immagine." };

  const { error } = await supabase
    .from("site_settings")
    .update({ splash_image_path: path, updated_at: new Date().toISOString() })
    .eq("id", true);

  if (error) return { error: "Errore durante il salvataggio dell'immagine." };

  revalidatePath("/", "layout");
}

export async function removeSplashImage() {
  const supabase = await createClient();
  await supabase
    .from("site_settings")
    .update({ splash_image_path: null, updated_at: new Date().toISOString() })
    .eq("id", true);

  revalidatePath("/", "layout");
}
