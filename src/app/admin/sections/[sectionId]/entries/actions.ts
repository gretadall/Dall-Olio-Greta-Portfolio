"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";
import { sanitizeEntryBody } from "@/lib/sanitize";

type FormState = { error?: string } | undefined;

function readEntryForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const periodStart = String(formData.get("period_start") ?? "").trim();
  const periodEnd = String(formData.get("period_end") ?? "").trim();
  const isPublished = formData.get("is_published") === "on";
  const slug = slugify(slugInput || title);

  return {
    title,
    slug,
    description,
    body,
    location,
    periodStart,
    periodEnd,
    isPublished,
  };
}

export async function createEntry(
  sectionId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const { title, slug, description, body, location, periodStart, periodEnd, isPublished } =
    readEntryForm(formData);

  if (!title) return { error: "Il titolo è obbligatorio." };
  if (!slug) return { error: "Slug non valido." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("entries")
    .insert({
      section_id: sectionId,
      title,
      slug,
      description: description || null,
      body: body ? sanitizeEntryBody(body) : null,
      location: location || null,
      period_start: periodStart || null,
      period_end: periodEnd || null,
      is_published: isPublished,
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      error:
        error?.code === "23505"
          ? "Esiste già un contenuto con questo slug in questa sezione."
          : "Errore durante la creazione.",
    };
  }

  revalidatePath(`/admin/sections/${sectionId}`);
  revalidatePath("/");
  redirect(`/admin/sections/${sectionId}/entries/${data.id}`);
}

export async function updateEntry(
  entryId: string,
  sectionId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const { title, slug, description, body, location, periodStart, periodEnd, isPublished } =
    readEntryForm(formData);

  if (!title) return { error: "Il titolo è obbligatorio." };
  if (!slug) return { error: "Slug non valido." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("entries")
    .update({
      title,
      slug,
      description: description || null,
      body: body ? sanitizeEntryBody(body) : null,
      location: location || null,
      period_start: periodStart || null,
      period_end: periodEnd || null,
      is_published: isPublished,
      updated_at: new Date().toISOString(),
    })
    .eq("id", entryId);

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Esiste già un contenuto con questo slug in questa sezione."
          : "Errore durante il salvataggio.",
    };
  }

  revalidatePath(`/admin/sections/${sectionId}`);
  revalidatePath("/");
  redirect(`/admin/sections/${sectionId}`);
}

export async function deleteEntry(sectionId: string, entryId: string) {
  const supabase = await createClient();
  await supabase.from("entries").delete().eq("id", entryId);
  revalidatePath(`/admin/sections/${sectionId}`);
  revalidatePath("/");
}

export async function reorderEntries(sectionId: string, orderedIds: string[]) {
  const supabase = await createClient();
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("entries").update({ sort_order: index }).eq("id", id)
    )
  );

  revalidatePath(`/admin/sections/${sectionId}`);
  revalidatePath("/");
}
