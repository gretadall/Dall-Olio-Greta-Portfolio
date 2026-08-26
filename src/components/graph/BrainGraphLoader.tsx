"use client";

import dynamic from "next/dynamic";
import type { GraphLink, GraphNode } from "@/components/graph/BrainGraph";
import type { BrainAreaContentMap } from "@/lib/brain-areas";

const BrainGraph = dynamic(
  () => import("@/components/graph/BrainGraph").then((mod) => mod.BrainGraph),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm text-muted">Caricamento della rete…</p>
    ),
  }
);

export function BrainGraphLoader({
  nodes,
  links,
  areaContent,
}: {
  nodes: GraphNode[];
  links: GraphLink[];
  areaContent: BrainAreaContentMap;
}) {
  return <BrainGraph nodes={nodes} links={links} areaContent={areaContent} />;
}
