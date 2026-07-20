import { createClient } from "@/lib/supabase/server";

export async function getPublishedSections() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getSectionBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getPublishedEntries(sectionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .eq("section_id", sectionId)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getEntryBySlug(sectionId: string, entrySlug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .eq("section_id", sectionId)
    .eq("slug", entrySlug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getEntryLikeState(entryId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { count, error: countError } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("entry_id", entryId);

  if (countError) throw countError;

  let liked = false;
  if (user) {
    const { data } = await supabase
      .from("likes")
      .select("user_id")
      .eq("entry_id", entryId)
      .eq("user_id", user.id)
      .maybeSingle();
    liked = !!data;
  }

  return { count: count ?? 0, liked, isAuthenticated: !!user };
}

export async function getEntryComments(entryId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("*, profiles(display_name, avatar_url)")
    .eq("entry_id", entryId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
