"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getIsAdmin } from "@/lib/supabase/auth";

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
]);

const SITE_SETTINGS_COLOR_FIELDS = [
  "primary_color",
  "accent_color",
  "background_color",
  "font_color",
  "muted_color",
  "nav_title_color",
] as const;

const SITE_SETTINGS_REQUIRED_COLOR_FIELDS = new Set<SiteSettingsColorField>([
  "primary_color",
  "accent_color",
]);

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

const SECTION_FIELDS = ["title", "description"] as const;
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
  if (field === "title" && !trimmed) {
    throw new Error("Il titolo non può essere vuoto.");
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
