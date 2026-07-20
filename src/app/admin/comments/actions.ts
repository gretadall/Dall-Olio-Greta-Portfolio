"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setCommentHidden(commentId: string, hidden: boolean) {
  const supabase = await createClient();
  await supabase
    .from("comments")
    .update({ is_hidden: hidden })
    .eq("id", commentId);
  revalidatePath("/admin/comments");
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient();
  await supabase.from("comments").delete().eq("id", commentId);
  revalidatePath("/admin/comments");
}
