export const GRAPH_PALETTE = [
  "#f97316",
  "#3b82f6",
  "#22c55e",
  "#a855f7",
  "#ef4444",
  "#eab308",
  "#06b6d4",
  "#ec4899",
];

type SectionLike = { id: string; slug: string; color: string | null };
type EntryLike = {
  id: string;
  title: string;
  slug: string;
  section_id: string;
  graph_x: number | null;
  graph_y: number | null;
};
type ConnectionLike = {
  id: string;
  from_entry_id: string;
  to_entry_id: string;
  label: string;
};

export function buildGraphNodes(sections: SectionLike[], entries: EntryLike[]) {
  const sectionColor = new Map(
    sections.map((s, i) => [s.id, s.color || GRAPH_PALETTE[i % GRAPH_PALETTE.length]])
  );
  const sectionSlug = new Map(sections.map((s) => [s.id, s.slug]));

  return entries.map((e) => ({
    id: e.id,
    title: e.title,
    href: `/${sectionSlug.get(e.section_id)}/${e.slug}`,
    color: sectionColor.get(e.section_id) ?? "#888888",
    graphX: e.graph_x,
    graphY: e.graph_y,
  }));
}

export function buildGraphLinks(connections: ConnectionLike[]) {
  return connections.map((c) => ({
    id: c.id,
    source: c.from_entry_id,
    target: c.to_entry_id,
    label: c.label,
  }));
}
