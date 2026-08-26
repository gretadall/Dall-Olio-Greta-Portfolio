"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";

type FormState = { error?: string } | undefined;

function readCategoryForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim();
  const slug = slugify(slugInput || name);

  return { name, slug, color };
}

export async function createCategory(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const { name, slug, color } = readCategoryForm(formData);

  if (!name) return { error: "Il nome è obbligatorio." };
  if (!slug) return { error: "Slug non valido." };

  const supabase = await createClient();
  const { error } = await supabase.from("blog_categories").insert({
    name,
    slug,
    color: color || "#888888",
  });

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Esiste già una categoria con questo slug."
          : "Errore durante la creazione.",
    };
  }

  revalidatePath("/admin/blog/categories");
  revalidatePath("/blog");
  redirect("/admin/blog/categories");
}

export async function updateCategory(
  categoryId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const { name, slug, color } = readCategoryForm(formData);

  if (!name) return { error: "Il nome è obbligatorio." };
  if (!slug) return { error: "Slug non valido." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("blog_categories")
    .update({ name, slug, color: color || "#888888" })
    .eq("id", categoryId);

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Esiste già una categoria con questo slug."
          : "Errore durante il salvataggio.",
    };
  }

  revalidatePath("/admin/blog/categories");
  revalidatePath("/blog");
  redirect("/admin/blog/categories");
}

export async function deleteCategory(categoryId: string) {
  const supabase = await createClient();
  await supabase.from("blog_categories").delete().eq("id", categoryId);
  revalidatePath("/admin/blog/categories");
  revalidatePath("/blog");
}

export async function reorderCategories(orderedIds: string[]) {
  const supabase = await createClient();
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("blog_categories").update({ sort_order: index }).eq("id", id)
    )
  );

  revalidatePath("/admin/blog/categories");
  revalidatePath("/blog");
}
