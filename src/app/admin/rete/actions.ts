"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveGraphPositions(
  positions: { id: string; x: number; y: number }[]
) {
  const supabase = await createClient();

  await Promise.all(
    positions.map((p) =>
      supabase
        .from("entries")
        .update({ graph_x: p.x, graph_y: p.y })
        .eq("id", p.id)
    )
  );

  revalidatePath("/rete");
  revalidatePath("/admin/rete");
}
