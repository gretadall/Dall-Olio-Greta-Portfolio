"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify, RESERVED_SLUGS } from "@/lib/slug";
import { sanitizeFileName } from "@/lib/supabase/media";

type FormState = { error?: string } | undefined;

function readSectionForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const icon = String(formData.get("icon") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim();
  const isPublished = formData.get("is_published") === "on";
  const slug = slugify(slugInput || title);

  return { title, slug, description, icon, color, isPublished };
}

export async function createSection(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const { title, slug, description, icon, color, isPublished } =
    readSectionForm(formData);

  if (!title) return { error: "Il titolo è obbligatorio." };
  if (!slug) return { error: "Slug non valido." };
  if (RESERVED_SLUGS.includes(slug)) {
    return { error: `Lo slug "${slug}" è riservato, scegline un altro.` };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("sections").insert({
    title,
    slug,
    description: description || null,
    icon: icon || null,
    color: color || null,
    is_published: isPublished,
  });

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Esiste già una sezione con questo slug."
          : "Errore durante la creazione.",
    };
  }

  revalidatePath("/admin/sections");
  revalidatePath("/");
  redirect("/admin/sections");
}

export async function updateSection(
  sectionId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const { title, slug, description, icon, color, isPublished } =
    readSectionForm(formData);

  if (!title) return { error: "Il titolo è obbligatorio." };
  if (!slug) return { error: "Slug non valido." };
  if (RESERVED_SLUGS.includes(slug)) {
    return { error: `Lo slug "${slug}" è riservato, scegline un altro.` };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("sections")
    .update({
      title,
      slug,
      description: description || null,
      icon: icon || null,
      color: color || null,
      is_published: isPublished,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sectionId);

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Esiste già una sezione con questo slug."
          : "Errore durante il salvataggio.",
    };
  }

  revalidatePath("/admin/sections");
  revalidatePath("/");
  redirect("/admin/sections");
}

export async function deleteSection(sectionId: string) {
  const supabase = await createClient();
  await supabase.from("sections").delete().eq("id", sectionId);
  revalidatePath("/admin/sections");
  revalidatePath("/");
}

export async function uploadSectionBackground(
  sectionId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Scegli un'immagine da caricare." };
  }

  try {
    const supabase = await createClient();
    const path = `sections/${sectionId}/${Date.now()}-${sanitizeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(path, file, { upsert: true });

    if (uploadError) return { error: `Errore durante il caricamento: ${uploadError.message}` };

    const { error } = await supabase
      .from("sections")
      .update({ background_image_path: path, updated_at: new Date().toISOString() })
      .eq("id", sectionId);

    if (error) return { error: `Errore durante il salvataggio: ${error.message}` };

    revalidatePath(`/admin/sections/${sectionId}`);
    revalidatePath("/");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: `Errore imprevisto durante il caricamento: ${message}` };
  }
}

export async function removeSectionBackground(sectionId: string) {
  const supabase = await createClient();
  await supabase
    .from("sections")
    .update({ background_image_path: null, updated_at: new Date().toISOString() })
    .eq("id", sectionId);

  revalidatePath(`/admin/sections/${sectionId}`);
  revalidatePath("/");
}

export async function moveSection(sectionId: string, direction: "up" | "down") {
  const supabase = await createClient();
  const { data: sections } = await supabase
    .from("sections")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });

  if (!sections) return;

  const index = sections.findIndex((s) => s.id === sectionId);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= sections.length) return;

  const current = sections[index];
  const swap = sections[swapIndex];

  await Promise.all([
    supabase
      .from("sections")
      .update({ sort_order: swap.sort_order })
      .eq("id", current.id),
    supabase
      .from("sections")
      .update({ sort_order: current.sort_order })
      .eq("id", swap.id),
  ]);

  revalidatePath("/admin/sections");
  revalidatePath("/");
}
