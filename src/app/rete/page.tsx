import { getPublicGraphData } from "@/lib/queries";
import { NetworkGraph } from "@/components/graph/NetworkGraph";

const PALETTE = [
  "#f97316",
  "#3b82f6",
  "#22c55e",
  "#a855f7",
  "#ef4444",
  "#eab308",
  "#06b6d4",
  "#ec4899",
];

export default async function RetePage() {
  const { sections, entries, connections } = await getPublicGraphData();

  const sectionColor = new Map(
    sections.map((s, i) => [s.id, PALETTE[i % PALETTE.length]])
  );
  const sectionSlug = new Map(sections.map((s) => [s.id, s.slug]));

  const nodes = entries.map((e) => ({
    id: e.id,
    title: e.title,
    href: `/${sectionSlug.get(e.section_id)}/${e.slug}`,
    color: sectionColor.get(e.section_id) ?? "#888888",
  }));

  const links = connections.map((c) => ({
    id: c.id,
    source: c.from_entry_id,
    target: c.to_entry_id,
    label: c.label,
  }));

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        Rete di connessioni
      </h1>
      <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">
        Come le esperienze si intrecciano e contribuiscono a formare chi sono.
      </p>

      {nodes.length === 0 ? (
        <p className="mt-12 text-sm text-zinc-500 dark:text-zinc-400">
          Nessun contenuto pubblicato ancora.
        </p>
      ) : (
        <div className="mt-12">
          <NetworkGraph nodes={nodes} links={links} />
        </div>
      )}
    </div>
  );
}
