"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type SendMagicLinkState = { error?: string; success?: boolean } | undefined;

export async function sendMagicLink(
  _prevState: SendMagicLinkState,
  formData: FormData
): Promise<SendMagicLinkState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: "Inserisci un indirizzo email." };
  }

  const origin = (await headers()).get("origin");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: "Non è stato possibile inviare il link. Riprova." };
  }

  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
