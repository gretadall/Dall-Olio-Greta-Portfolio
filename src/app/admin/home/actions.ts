"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getIsAdmin } from "@/lib/supabase/auth";
import { isHomePickKind, parseHomePicks } from "@/lib/home-picks";

/** Save one of the home page's hand-picked lists (an empty list = automatic). */
export async function updateHomePicks(kind: string, ids: string[]) {
  if (!(await getIsAdmin())) throw new Error("Non autorizzato.");
  if (!isHomePickKind(kind)) throw new Error("Elenco non valido.");
  const clean = [...new Set(ids.filter((id) => typeof id === "string" && id.length <= 64))];

  const supabase = await createClient();
  const { data, error: readError } = await supabase
    .from("site_settings")
    .select("home_picks")
    .eq("id", true)
    .single();
  if (readError) throw new Error("Errore durante il caricamento.");

  const next = { ...parseHomePicks(data?.home_picks), [kind]: clean };
  const { error } = await supabase
    .from("site_settings")
    .update({ home_picks: next, updated_at: new Date().toISOString() } as never)
    .eq("id", true);
  if (error) throw new Error("Errore durante il salvataggio.");

  revalidatePath("/", "layout");
}
