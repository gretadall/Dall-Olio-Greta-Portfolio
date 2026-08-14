"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from "d3-force";

export type GraphNode = {
  id: string;
  title: string;
  href: string;
  color: string;
  graphX?: number | null;
  graphY?: number | null;
};

export type GraphLink = {
  id: string;
  source: string;
  target: string;
  label: string;
};

type SimNode = GraphNode & SimulationNodeDatum;
type SimLink = SimulationLinkDatum<SimNode> & { id: string; label: string };

const WIDTH = 800;
const HEIGHT = 560;

function computeLayout(nodes: GraphNode[], links: GraphLink[]) {
  const nodesCopy: SimNode[] = nodes.map((n) => {
    const hasSaved = n.graphX != null && n.graphY != null;
    return {
      ...n,
      x: hasSaved ? n.graphX! : undefined,
      y: hasSaved ? n.graphY! : undefined,
      fx: hasSaved ? n.graphX! : undefined,
      fy: hasSaved ? n.graphY! : undefined,
    };
  });
  const linksCopy: SimLink[] = links.map((l) => ({
    id: l.id,
    label: l.label,
    source: l.source,
    target: l.target,
  }));

  const simulation = forceSimulation(nodesCopy)
    .force(
      "link",
      forceLink<SimNode, SimLink>(linksCopy)
        .id((d) => d.id)
        .distance(130)
    )
    .force("charge", forceManyBody().strength(-220))
    .force("center", forceCenter(WIDTH / 2, HEIGHT / 2))
    .force("collide", forceCollide(48))
    .stop();

  for (let i = 0; i < 300; i++) simulation.tick();

  return { simNodes: nodesCopy, simLinks: linksCopy };
}

export function NetworkGraph({
  nodes,
  links,
  editable = false,
  onSave,
}: {
  nodes: GraphNode[];
  links: GraphLink[];
  editable?: boolean;
  onSave?: (positions: { id: string; x: number; y: number }[]) => Promise<void>;
}) {
  const layout = useMemo(() => computeLayout(nodes, links), [nodes, links]);
  const [liveNodes, setLiveNodes] = useState(layout.simNodes);
  const [syncedLayout, setSyncedLayout] = useState(layout);
  const draggingId = useRef<string | null>(null);
  const draggedRef = useRef(false);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (layout !== syncedLayout) {
    setSyncedLayout(layout);
    setLiveNodes(layout.simNodes);
  }

  const simNodes = editable ? liveNodes : layout.simNodes;
  const simLinks = layout.simLinks;
  const visibleLinks = editable
    ? simLinks
    : simLinks.filter((link) => {
        const source = link.source as SimNode;
        const target = link.target as SimNode;
        return source.id === selectedId || target.id === selectedId;
      });

  function handlePointerDown(
    e: React.PointerEvent<SVGGElement>,
    nodeId: string
  ) {
    if (!editable) return;
    draggingId.current = nodeId;
    draggedRef.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<SVGGElement>) {
    if (!editable || !draggingId.current) return;
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;

    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(ctm.inverse());

    const node = simNodes.find((n) => n.id === draggingId.current);
    if (!node) return;

    node.x = svgP.x;
    node.y = svgP.y;
    node.fx = svgP.x;
    node.fy = svgP.y;
    draggedRef.current = true;
    setSaved(false);
    setLiveNodes([...simNodes]);
  }

  function handlePointerUp() {
    draggingId.current = null;
  }

  function handleSave() {
    if (!onSave) return;
    const positions = simNodes
      .filter((n) => n.x != null && n.y != null)
      .map((n) => ({ id: n.id, x: n.x as number, y: n.y as number }));

    startTransition(async () => {
      await onSave(positions);
      setSaved(true);
    });
  }

  return (
    <div>
      {!editable && (
        <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
          Clicca su un punto per vedere i suoi collegamenti.
        </p>
      )}
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full text-zinc-400 dark:text-zinc-600"
      >
        {visibleLinks.map((link) => {
          const source = link.source as SimNode;
          const target = link.target as SimNode;
          if (source.x == null || target.x == null) return null;
          const midX = (source.x + target.x) / 2;
          const midY = (source.y! + target.y!) / 2;

          return (
            <g key={link.id}>
              <line
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke="currentColor"
                strokeWidth={1.5}
                markerEnd="url(#arrow)"
              />
              <text
                x={midX}
                y={midY}
                fontSize={11}
                textAnchor="middle"
                className="fill-zinc-500 dark:fill-zinc-400"
              >
                {link.label}
              </text>
            </g>
          );
        })}

        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="24"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
          </marker>
        </defs>

        {simNodes.map((node) => {
          const isSelected = node.id === selectedId;
          const circle = (
            <circle
              cx={node.x}
              cy={node.y}
              r={10}
              fill={node.color}
              stroke={isSelected ? "currentColor" : "white"}
              strokeWidth={isSelected ? 2.5 : 1.5}
            />
          );
          const label = (
            <text
              x={node.x}
              y={(node.y ?? 0) + 24}
              fontSize={12}
              textAnchor="middle"
              className="fill-zinc-900 dark:fill-zinc-100"
            >
              {node.title}
            </text>
          );

          if (editable) {
            return (
              <g
                key={node.id}
                onPointerDown={(e) => handlePointerDown(e, node.id)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="cursor-grab active:cursor-grabbing"
              >
                {circle}
                {label}
              </g>
            );
          }

          return (
            <g
              key={node.id}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              onClick={() =>
                setSelectedId((prev) => (prev === node.id ? null : node.id))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedId((prev) => (prev === node.id ? null : node.id));
                }
              }}
              className="cursor-pointer text-accent outline-none"
            >
              {circle}
              <a href={node.href} onClick={(e) => e.stopPropagation()}>
                {label}
              </a>
            </g>
          );
        })}
      </svg>

      {editable && (
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {isPending ? "Salvataggio…" : "Salva disposizione"}
          </button>
          {saved && !isPending && (
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Disposizione salvata.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
