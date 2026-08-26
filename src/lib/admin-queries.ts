import { createClient } from "@/lib/supabase/server";

export async function getAllSections() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getSectionById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getAllEntries(sectionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .eq("section_id", sectionId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getEntryById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getAllComments() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select(
      "*, profiles(display_name, email), entries(title, slug, sections(slug))"
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getFollowers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("follows")
    .select("*, profiles(display_name, email, avatar_url)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getAllEntriesFlat() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("entries")
    .select("id, title, section_id, sections(title)")
    .order("title", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getEntryOutgoingConnections(entryId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("connections")
    .select(
      "id, label, bidirectional, to_entry:entries!connections_to_entry_id_fkey(title, sections(title))"
    )
    .eq("from_entry_id", entryId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getAdminGraphData() {
  const supabase = await createClient();

  const [sections, entries, connections] = await Promise.all([
    supabase.from("sections").select("*"),
    supabase
      .from("entries")
      .select("id, title, slug, section_id, graph_x, graph_y"),
    supabase
      .from("connections")
      .select("id, from_entry_id, to_entry_id, label, bidirectional"),
  ]);

  if (sections.error) throw sections.error;
  if (entries.error) throw entries.error;
  if (connections.error) throw connections.error;

  return {
    sections: sections.data,
    entries: entries.data,
    connections: connections.data,
  };
}

export async function getAllTravelPins() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("travel_pins")
    .select("*, entries(title)")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getTravelPinById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("travel_pins")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getTravelEntries() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("entries")
    .select("id, title, sections!inner(slug)")
    .eq("sections.slug", "viaggi")
    .order("title", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getAllBlogCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getBlogCategoryById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getAllBlogPosts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*, blog_categories(name, color)")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getBlogPostById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getDashboardCounts() {
  const supabase = await createClient();
  const [sections, entries, comments, followers] = await Promise.all([
    supabase.from("sections").select("*", { count: "exact", head: true }),
    supabase.from("entries").select("*", { count: "exact", head: true }),
    supabase.from("comments").select("*", { count: "exact", head: true }),
    supabase.from("follows").select("*", { count: "exact", head: true }),
  ]);

  return {
    sections: sections.count ?? 0,
    entries: entries.count ?? 0,
    comments: comments.count ?? 0,
    followers: followers.count ?? 0,
  };
}
