"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleFollow() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Devi accedere per iscriverti." };

  const { data: existing } = await supabase
    .from("follows")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("follows").delete().eq("user_id", user.id);
  } else {
    await supabase.from("follows").insert({ user_id: user.id });
  }

  revalidatePath("/");
}
