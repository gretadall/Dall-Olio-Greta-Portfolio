"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getIsAdmin } from "@/lib/supabase/auth";
import { isBrainAreaSlug, type BrainAreaSlug } from "@/lib/brain-areas";
import { isUiTextKey } from "@/lib/ui-texts";

const SITE_SETTINGS_TEXT_FIELDS = [
  "site_title",
  "owner_name",
  "tagline",
  "nav_home_label",
  "nav_rete_label",
  "linkedin_label",
  "contact_button_label",
  "footer_text",
  "nav_chi_sono_label",
  "nav_blog_label",
  "vision_icon",
  "rete_title",
  "rete_intro",
  "rete_hint",
  "rete_note",
  "rete_disclaimer",
  "blog_title",
  "blog_empty_text",
] as const;

const SITE_SETTINGS_REQUIRED_TEXT_FIELDS = new Set<SiteSettingsTextField>([
  "site_title",
  "nav_home_label",
  "nav_rete_label",
  "linkedin_label",
  "contact_button_label",
  "footer_text",
  "nav_chi_sono_label",
  "nav_blog_label",
  "blog_title",
]);

const SITE_SETTINGS_COLOR_FIELDS = ["primary_color", "background_color", "font_color"] as const;

const SITE_SETTINGS_REQUIRED_COLOR_FIELDS = new Set<SiteSettingsColorField>(["primary_color"]);

export type SiteSettingsTextField = (typeof SITE_SETTINGS_TEXT_FIELDS)[number];
export type SiteSettingsColorField = (typeof SITE_SETTINGS_COLOR_FIELDS)[number];

async function requireAdmin() {
  if (!(await getIsAdmin())) throw new Error("Non autorizzato.");
}

export async function updateSiteSettingsField(
  field: SiteSettingsTextField | SiteSettingsColorField,
  value: string
) {
  await requireAdmin();

  const isTextField = (SITE_SETTINGS_TEXT_FIELDS as readonly string[]).includes(field);
  const isColorField = (SITE_SETTINGS_COLOR_FIELDS as readonly string[]).includes(field);
  if (!isTextField && !isColorField) throw new Error("Campo non modificabile.");

  const trimmed = value.trim();
  const required = isTextField
    ? SITE_SETTINGS_REQUIRED_TEXT_FIELDS.has(field as SiteSettingsTextField)
    : SITE_SETTINGS_REQUIRED_COLOR_FIELDS.has(field as SiteSettingsColorField);

  if (required && !trimmed) throw new Error("Questo campo non può essere vuoto.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .update({
      [field]: trimmed || null,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", true);

  if (error) throw new Error("Errore durante il salvataggio.");

  revalidatePath("/", "layout");
}

const SECTION_FIELDS = ["title", "description", "icon", "cta_label"] as const;
export type SectionField = (typeof SECTION_FIELDS)[number];

export async function updateSectionField(
  id: string,
  field: SectionField,
  value: string
) {
  await requireAdmin();
  if (!(SECTION_FIELDS as readonly string[]).includes(field)) {
    throw new Error("Campo non modificabile.");
  }

  const trimmed = value.trim();
  if ((field === "title" || field === "cta_label") && !trimmed) {
    throw new Error("Questo campo non può essere vuoto.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("sections")
    .update({
      [field]: trimmed || null,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", id);

  if (error) throw new Error("Errore durante il salvataggio.");

  revalidatePath("/", "layout");
}

const ENTRY_FIELDS = ["title"] as const;
export type EntryField = (typeof ENTRY_FIELDS)[number];

export async function updateEntryField(id: string, field: EntryField, value: string) {
  await requireAdmin();
  if (!(ENTRY_FIELDS as readonly string[]).includes(field)) {
    throw new Error("Campo non modificabile.");
  }

  const trimmed = value.trim();
  if (!trimmed) throw new Error("Il titolo non può essere vuoto.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("entries")
    .update({ [field]: trimmed, updated_at: new Date().toISOString() } as never)
    .eq("id", id);

  if (error) throw new Error("Errore durante il salvataggio.");

  revalidatePath("/", "layout");
}

const BRAIN_AREA_FIELDS = ["label", "description"] as const;
export type BrainAreaField = (typeof BRAIN_AREA_FIELDS)[number];

export async function updateBrainAreaField(
  slug: string,
  field: BrainAreaField,
  value: string
) {
  await requireAdmin();
  if (!(BRAIN_AREA_FIELDS as readonly string[]).includes(field)) {
    throw new Error("Campo non modificabile.");
  }

  const trimmed = value.trim();
  if (field === "label" && !trimmed) {
    throw new Error("Questo campo non può essere vuoto.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("brain_areas")
    .update({
      [field]: trimmed || null,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("slug", slug);

  if (error) throw new Error("Errore durante il salvataggio.");

  revalidatePath("/", "layout");
}

export async function updateEntryGraphPosition(
  id: string,
  x: number,
  y: number,
  z: number,
  brainArea?: BrainAreaSlug
) {
  await requireAdmin();
  if (brainArea != null && !isBrainAreaSlug(brainArea)) {
    throw new Error("Area cerebrale non valida.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("entries")
    .update({
      graph_x: x,
      graph_y: y,
      graph_z: z,
      ...(brainArea != null ? { brain_area: brainArea } : {}),
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", id);

  if (error) throw new Error("Errore durante il salvataggio della posizione.");

  revalidatePath("/", "layout");
}

export async function resetEntryGraphPosition(id: string) {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase
    .from("entries")
    .update({
      graph_x: null,
      graph_y: null,
      graph_z: null,
      updated_at: new Date().toISOString(),
    } as never)
    .eq("id", id);

  if (error) throw new Error("Errore durante il ripristino della posizione.");

  revalidatePath("/", "layout");
}

// Interface texts: one override per key, merged into site_settings.ui_texts.
// An empty value removes the override, bringing back the default wording.
export async function updateUiText(key: string, value: string) {
  await requireAdmin();
  if (!isUiTextKey(key)) throw new Error("Testo non modificabile.");

  const supabase = await createClient();
  const { data, error: readError } = await supabase
    .from("site_settings")
    .select("ui_texts")
    .eq("id", true)
    .single();
  if (readError) throw new Error("Errore durante il caricamento dei testi.");

  const next = { ...((data?.ui_texts ?? {}) as Record<string, unknown>) };
  const trimmed = value.trim();
  if (trimmed) next[key] = trimmed;
  else delete next[key];

  const { error } = await supabase
    .from("site_settings")
    .update({ ui_texts: next, updated_at: new Date().toISOString() } as never)
    .eq("id", true);
  if (error) throw new Error("Errore durante il salvataggio.");

  revalidatePath("/", "layout");
}
