"use client";

import { useMemo } from "react";
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

export function NetworkGraph({
  nodes,
  links,
}: {
  nodes: GraphNode[];
  links: GraphLink[];
}) {
  const { simNodes, simLinks } = useMemo(() => {
    const nodesCopy: SimNode[] = nodes.map((n) => ({ ...n }));
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
  }, [nodes, links]);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-auto w-full text-zinc-400 dark:text-zinc-600"
    >
      {simLinks.map((link) => {
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

      {simNodes.map((node) => (
        <a key={node.id} href={node.href}>
          <circle
            cx={node.x}
            cy={node.y}
            r={10}
            fill={node.color}
            stroke="white"
            strokeWidth={1.5}
          />
          <text
            x={node.x}
            y={(node.y ?? 0) + 24}
            fontSize={12}
            textAnchor="middle"
            className="fill-zinc-900 dark:fill-zinc-100"
          >
            {node.title}
          </text>
        </a>
      ))}
    </svg>
  );
}
