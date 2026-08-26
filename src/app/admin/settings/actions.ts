"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sanitizeFileName } from "@/lib/supabase/media";
import { sanitizeEntryBody } from "@/lib/sanitize";

const FONT_CHOICES = ["geist", "inter", "playfair", "space-mono"] as const;

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
  const accentColor = String(formData.get("accent_color") ?? "").trim();
  const navTitleColor = String(formData.get("nav_title_color") ?? "").trim();
  const backgroundColor = String(formData.get("background_color") ?? "").trim();
  const fontColor = String(formData.get("font_color") ?? "").trim();
  const mutedColor = String(formData.get("muted_color") ?? "").trim();
  const fontChoice = String(formData.get("font_choice") ?? "").trim();
  const linkedinUrl = String(formData.get("linkedin_url") ?? "").trim();
  const contactEmail = String(formData.get("contact_email") ?? "").trim();
  const heroPhotoSize = Number(formData.get("hero_photo_size") ?? 96);
  const heroPhotoRadius = Number(formData.get("hero_photo_radius") ?? 50);
  const heroOverlayDarkness = Number(formData.get("hero_overlay_darkness") ?? 55);
  const splashEnabled = formData.get("splash_enabled") === "on";
  const splashTitle = String(formData.get("splash_title") ?? "").trim();
  const splashMessage = String(formData.get("splash_message") ?? "").trim();
  const splashDurationSeconds = Number(
    formData.get("splash_duration_seconds") ?? 3
  );
  const navHomeLabel = String(formData.get("nav_home_label") ?? "").trim();
  const navReteLabel = String(formData.get("nav_rete_label") ?? "").trim();
  const linkedinLabel = String(formData.get("linkedin_label") ?? "").trim();
  const contactButtonLabel = String(
    formData.get("contact_button_label") ?? ""
  ).trim();
  const footerText = String(formData.get("footer_text") ?? "").trim();

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
  if (
    !Number.isFinite(heroOverlayDarkness) ||
    heroOverlayDarkness < 0 ||
    heroOverlayDarkness > 100
  ) {
    return { error: "Scurità sfondo \"Chi sono\" non valida." };
  }
  if (
    !Number.isFinite(splashDurationSeconds) ||
    splashDurationSeconds < 1 ||
    splashDurationSeconds > 15
  ) {
    return { error: "Durata pagina di anteprima non valida." };
  }
  if (!navHomeLabel || !navReteLabel || !linkedinLabel || !contactButtonLabel) {
    return { error: "I testi dei bottoni non possono essere vuoti." };
  }
  if (!footerText) return { error: "Il testo del footer non può essere vuoto." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .update({
      site_title: siteTitle,
      tagline: tagline || null,
      owner_name: ownerName || null,
      primary_color: primaryColor,
      accent_color: accentColor,
      nav_title_color: navTitleColor || null,
      background_color: backgroundColor || null,
      font_color: fontColor || null,
      muted_color: mutedColor || null,
      font_choice: fontChoice,
      linkedin_url: linkedinUrl || null,
      contact_email: contactEmail || null,
      hero_photo_size: heroPhotoSize,
      hero_photo_radius: heroPhotoRadius,
      hero_overlay_darkness: heroOverlayDarkness,
      splash_enabled: splashEnabled,
      splash_title: splashTitle || null,
      splash_message: splashMessage || null,
      splash_duration_seconds: splashDurationSeconds,
      nav_home_label: navHomeLabel,
      nav_rete_label: navReteLabel,
      linkedin_label: linkedinLabel,
      contact_button_label: contactButtonLabel,
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
  const visionIcon = String(formData.get("vision_icon") ?? "").trim();
  const formazioneIntro = String(formData.get("formazione_intro") ?? "").trim();
  const formazioneBody = String(formData.get("formazione_body") ?? "").trim();

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .update({
      vision_text: visionText ? sanitizeEntryBody(visionText) : null,
      vision_icon: visionIcon || null,
      formazione_intro: formazioneIntro || null,
      formazione_body: formazioneBody ? sanitizeEntryBody(formazioneBody) : null,
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

export async function uploadHeroBackground(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Scegli un'immagine da caricare." };
  }

  try {
    const supabase = await createClient();
    const path = `hero-background/${Date.now()}-${sanitizeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(path, file, { upsert: true });

    if (uploadError) return { error: `Errore durante il caricamento: ${uploadError.message}` };

    const { error } = await supabase
      .from("site_settings")
      .update({ hero_background_image_path: path, updated_at: new Date().toISOString() })
      .eq("id", true);

    if (error) return { error: `Errore durante il salvataggio: ${error.message}` };

    revalidatePath("/", "layout");
  } catch (err) {
    return describeError(err);
  }
}

export async function removeHeroBackground() {
  const supabase = await createClient();
  await supabase
    .from("site_settings")
    .update({ hero_background_image_path: null, updated_at: new Date().toISOString() })
    .eq("id", true);

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

  try {
    const supabase = await createClient();
    const path = `background/${Date.now()}-${sanitizeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(path, file, { upsert: true });

    if (uploadError) return { error: `Errore durante il caricamento: ${uploadError.message}` };

    const { error } = await supabase
      .from("site_settings")
      .update({ background_image_path: path, updated_at: new Date().toISOString() })
      .eq("id", true);

    if (error) return { error: `Errore durante il salvataggio: ${error.message}` };

    revalidatePath("/", "layout");
  } catch (err) {
    return describeError(err);
  }
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

  try {
    const supabase = await createClient();
    const path = `splash/${Date.now()}-${sanitizeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(path, file, { upsert: true });

    if (uploadError) return { error: `Errore durante il caricamento: ${uploadError.message}` };

    const { error } = await supabase
      .from("site_settings")
      .update({ splash_image_path: path, updated_at: new Date().toISOString() })
      .eq("id", true);

    if (error) return { error: `Errore durante il salvataggio: ${error.message}` };

    revalidatePath("/", "layout");
  } catch (err) {
    return describeError(err);
  }
}

export async function removeSplashImage() {
  const supabase = await createClient();
  await supabase
    .from("site_settings")
    .update({ splash_image_path: null, updated_at: new Date().toISOString() })
    .eq("id", true);

  revalidatePath("/", "layout");
}
