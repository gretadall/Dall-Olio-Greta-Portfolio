import { createClient } from "@/lib/supabase/server";

export async function getSiteSettings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", true)
    .single();

  if (error) throw error;
  return data;
}

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

export async function getEntryMedia(entryId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("entry_media")
    .select("*")
    .eq("entry_id", entryId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getEntryConnections(entryId: string) {
  const supabase = await createClient();

  const [outgoing, incoming] = await Promise.all([
    supabase
      .from("connections")
      .select(
        "id, label, bidirectional, to_entry:entries!connections_to_entry_id_fkey(title, slug, sections(slug))"
      )
      .eq("from_entry_id", entryId),
    supabase
      .from("connections")
      .select(
        "id, label, bidirectional, from_entry:entries!connections_from_entry_id_fkey(title, slug, sections(slug))"
      )
      .eq("to_entry_id", entryId),
  ]);

  if (outgoing.error) throw outgoing.error;
  if (incoming.error) throw incoming.error;

  return { outgoing: outgoing.data, incoming: incoming.data };
}

export async function getPublishedTravelPins() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("travel_pins")
    .select("*, entries(slug, sections(slug))")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getChiSonoSections() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .eq("is_published", true)
    .eq("page_placement", "chi_sono")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getBlogCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getPublishedBlogPostsPage({
  page,
  pageSize,
  categorySlug,
}: {
  page: number;
  pageSize: number;
  categorySlug?: string;
}) {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("blog_posts")
    .select(
      categorySlug
        ? "*, blog_categories!inner(id, name, slug, color)"
        : "*, blog_categories(id, name, slug, color)",
      { count: "exact" }
    )
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .range(from, to);

  if (categorySlug) query = query.eq("blog_categories.slug", categorySlug);

  const { data, error, count } = await query;
  if (error) throw error;
  return { posts: data, total: count ?? 0 };
}

export async function getBlogPostBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*, blog_categories(name, slug, color)")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getPublicGraphData() {
  const supabase = await createClient();

  const [sections, entries, connections] = await Promise.all([
    supabase.from("sections").select("*").eq("is_published", true),
    supabase
      .from("entries")
      .select("id, title, slug, section_id, graph_x, graph_y, graph_z, brain_area")
      .eq("is_published", true),
    supabase
      .from("connections")
      .select("id, from_entry_id, to_entry_id, label, bidirectional"),
  ]);

  if (sections.error) throw sections.error;
  if (entries.error) throw entries.error;
  if (connections.error) throw connections.error;

  const publishedSectionIds = new Set(sections.data.map((s) => s.id));
  const publishedEntries = entries.data.filter((e) =>
    publishedSectionIds.has(e.section_id)
  );
  const publishedEntryIds = new Set(publishedEntries.map((e) => e.id));
  const visibleConnections = connections.data.filter(
    (c) =>
      publishedEntryIds.has(c.from_entry_id) &&
      publishedEntryIds.has(c.to_entry_id)
  );

  return {
    sections: sections.data,
    entries: publishedEntries,
    connections: visibleConnections,
  };
}

export async function getBrainAreaContent() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brain_areas")
    .select("slug, label, description");

  if (error) throw error;
  return data;
}
