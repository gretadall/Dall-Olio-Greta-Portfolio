"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";
import { sanitizeEntryBody } from "@/lib/sanitize";
import { sanitizeFileName } from "@/lib/supabase/media";

type FormState = { error?: string } | undefined;

function readPostForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const categoryId = String(formData.get("category_id") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const publishedAt = String(formData.get("published_at") ?? "").trim();
  const isPublished = formData.get("is_published") === "on";
  const slug = slugify(slugInput || title);

  return { title, slug, categoryId, excerpt, body, publishedAt, isPublished };
}

export async function createPost(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const { title, slug, categoryId, excerpt, body, publishedAt, isPublished } =
    readPostForm(formData);

  if (!title) return { error: "Il titolo è obbligatorio." };
  if (!slug) return { error: "Slug non valido." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      title,
      slug,
      category_id: categoryId || null,
      excerpt: excerpt || null,
      body: body ? sanitizeEntryBody(body) : null,
      is_published: isPublished,
      published_at: publishedAt
        ? new Date(publishedAt).toISOString()
        : isPublished
          ? new Date().toISOString()
          : null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      error:
        error?.code === "23505"
          ? "Esiste già un articolo con questo slug."
          : "Errore durante la creazione.",
    };
  }

  revalidatePath("/admin/blog/posts");
  revalidatePath("/blog");
  redirect(`/admin/blog/posts/${data.id}`);
}

export async function updatePost(
  postId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const { title, slug, categoryId, excerpt, body, publishedAt, isPublished } =
    readPostForm(formData);

  if (!title) return { error: "Il titolo è obbligatorio." };
  if (!slug) return { error: "Slug non valido." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("blog_posts")
    .update({
      title,
      slug,
      category_id: categoryId || null,
      excerpt: excerpt || null,
      body: body ? sanitizeEntryBody(body) : null,
      is_published: isPublished,
      published_at: publishedAt
        ? new Date(publishedAt).toISOString()
        : isPublished
          ? new Date().toISOString()
          : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId);

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Esiste già un articolo con questo slug."
          : "Errore durante il salvataggio.",
    };
  }

  revalidatePath("/admin/blog/posts");
  revalidatePath("/blog");
  redirect(`/admin/blog/posts/${postId}`);
}

export async function deletePost(postId: string) {
  const supabase = await createClient();
  await supabase.from("blog_posts").delete().eq("id", postId);
  revalidatePath("/admin/blog/posts");
  revalidatePath("/blog");
}

export async function reorderPosts(orderedIds: string[]) {
  const supabase = await createClient();
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("blog_posts").update({ sort_order: index }).eq("id", id)
    )
  );

  revalidatePath("/admin/blog/posts");
  revalidatePath("/blog");
}

export async function uploadPostCover(
  postId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Scegli un'immagine da caricare." };
  }

  try {
    const supabase = await createClient();
    const path = `blog-posts/${postId}/${Date.now()}-${sanitizeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(path, file, { upsert: true });

    if (uploadError) return { error: `Errore durante il caricamento: ${uploadError.message}` };

    const { error } = await supabase
      .from("blog_posts")
      .update({ cover_image_path: path, updated_at: new Date().toISOString() })
      .eq("id", postId);

    if (error) return { error: `Errore durante il salvataggio: ${error.message}` };

    revalidatePath(`/admin/blog/posts/${postId}`);
    revalidatePath("/blog");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { error: `Errore imprevisto durante il caricamento: ${message}` };
  }
}

export async function removePostCover(postId: string) {
  const supabase = await createClient();
  await supabase
    .from("blog_posts")
    .update({ cover_image_path: null, updated_at: new Date().toISOString() })
    .eq("id", postId);

  revalidatePath(`/admin/blog/posts/${postId}`);
  revalidatePath("/blog");
}
