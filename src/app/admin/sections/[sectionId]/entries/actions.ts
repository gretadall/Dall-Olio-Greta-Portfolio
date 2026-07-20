"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";

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
  const { error } = await supabase.from("entries").insert({
    section_id: sectionId,
    title,
    slug,
    description: description || null,
    body: body || null,
    location: location || null,
    period_start: periodStart || null,
    period_end: periodEnd || null,
    is_published: isPublished,
  });

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Esiste già un contenuto con questo slug in questa sezione."
          : "Errore durante la creazione.",
    };
  }

  revalidatePath(`/admin/sections/${sectionId}`);
  revalidatePath("/");
  redirect(`/admin/sections/${sectionId}`);
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
      body: body || null,
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

export async function deleteEntry(entryId: string, sectionId: string) {
  const supabase = await createClient();
  await supabase.from("entries").delete().eq("id", entryId);
  revalidatePath(`/admin/sections/${sectionId}`);
  revalidatePath("/");
}

export async function moveEntry(
  entryId: string,
  sectionId: string,
  direction: "up" | "down"
) {
  const supabase = await createClient();
  const { data: entries } = await supabase
    .from("entries")
    .select("id, sort_order")
    .eq("section_id", sectionId)
    .order("sort_order", { ascending: true });

  if (!entries) return;

  const index = entries.findIndex((e) => e.id === entryId);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= entries.length) return;

  const current = entries[index];
  const swap = entries[swapIndex];

  await Promise.all([
    supabase
      .from("entries")
      .update({ sort_order: swap.sort_order })
      .eq("id", current.id),
    supabase
      .from("entries")
      .update({ sort_order: current.sort_order })
      .eq("id", swap.id),
  ]);

  revalidatePath(`/admin/sections/${sectionId}`);
  revalidatePath("/");
}
