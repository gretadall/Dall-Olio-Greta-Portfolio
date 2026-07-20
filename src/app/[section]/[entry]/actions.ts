"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleLike(
  entryId: string,
  sectionSlug: string,
  entrySlug: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Devi accedere per mettere like." };

  const { data: existing } = await supabase
    .from("likes")
    .select("user_id")
    .eq("entry_id", entryId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("likes")
      .delete()
      .eq("entry_id", entryId)
      .eq("user_id", user.id);
  } else {
    await supabase.from("likes").insert({ entry_id: entryId, user_id: user.id });
  }

  revalidatePath(`/${sectionSlug}/${entrySlug}`);
}

type CommentState = { error?: string } | undefined;

export async function postComment(
  entryId: string,
  sectionSlug: string,
  entrySlug: string,
  _prevState: CommentState,
  formData: FormData
): Promise<CommentState> {
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Scrivi qualcosa prima di inviare." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Devi accedere per commentare." };

  const { error } = await supabase
    .from("comments")
    .insert({ entry_id: entryId, user_id: user.id, body });

  if (error) return { error: "Non è stato possibile pubblicare il commento." };

  revalidatePath(`/${sectionSlug}/${entrySlug}`);
}
