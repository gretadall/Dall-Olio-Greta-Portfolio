"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import * as THREE from "three";
import { Canvas, useLoader, type ThreeEvent } from "@react-three/fiber";
import { Billboard, Html, Line, OrbitControls, Text } from "@react-three/drei";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import {
  BRAIN_AREAS,
  getBrainArea,
  nearestBrainArea,
  nodeDirection,
  resolveBrainArea,
} from "@/lib/brain-areas";
import type { BrainAreaSlug } from "@/lib/brain-areas";

export type GraphNode = {
  id: string;
  title: string;
  href: string;
  color: string;
  brainArea: BrainAreaSlug | null;
};

export type GraphLink = {
  id: string;
  source: string;
  target: string;
  label: string;
  bidirectional: boolean;
};

const AUTO_ROTATE_SPEED = 0.6;
const NODE_SURFACE_OFFSET = 0.06;

const AREA_COLOR: Record<BrainAreaSlug, [number, number, number]> = Object.fromEntries(
  BRAIN_AREAS.map((a) => {
    const c = new THREE.Color(a.color);
    return [a.slug, [c.r, c.g, c.b]];
  }),
) as Record<BrainAreaSlug, [number, number, number]>;

const AREA_SLUGS = BRAIN_AREAS.map((a) => a.slug);

// Axis remap from the brain STL's raw coordinates (in an order/orientation
// the file itself doesn't declare) into this scene's (x = left-right,
// y = up, z = front). Flip a sign here if the loaded model turns out
// mirrored or upside down.
const AXIS_SIGN: [number, number, number] = [1, 1, 1];

const TARGET_HALF_EXTENT = 1.5;
// Percentile used for the robust bounding box: the raw scan includes a thin
// brainstem/cord stub trailing far past the brain mass on one axis, which
// would otherwise dominate a plain min/max bounding box and squash the
// brain itself into a fraction of the frame.
const TRIM_PERCENTILE = 0.02;
// Nudges boundary lines outward along the surface normal so they sit on
// top of the shell instead of z-fighting with it.
const BOUNDARY_OFFSET = 0.012;
// Smoothing passes for the per-vertex area assignment: the raw scan mesh is
// dense and irregular, so a hard nearest-area cut through it zigzags along
// individual triangle edges. Repeatedly relabeling each vertex to match the
// majority of its neighbors erodes that into a smooth, rounded boundary.
const SMOOTH_ITERATIONS = 14;

function percentileBounds(values: Float32Array, stride: number, component: number, p: number) {
  const count = values.length / stride;
  const sorted = new Float32Array(count);
  for (let i = 0; i < count; i++) sorted[i] = values[i * stride + component];
  sorted.sort();
  const lo = sorted[Math.floor(p * count)];
  const hi = sorted[Math.floor((1 - p) * count)];
  return { center: (lo + hi) / 2, halfExtent: (hi - lo) / 2 };
}

// Compressed-sparse-row adjacency (flat typed arrays, no Set/object
// allocation per vertex) — building this with per-vertex Sets was slow
// enough on a ~40k-vertex mesh to visibly stall the page on load.
function buildAdjacency(index: ArrayLike<number>, vertexCount: number) {
  const degree = new Int32Array(vertexCount);
  for (let t = 0; t < index.length; t += 3) {
    const a = index[t];
    const b = index[t + 1];
    const c = index[t + 2];
    degree[a] += 2;
    degree[b] += 2;
    degree[c] += 2;
  }

  const offsets = new Int32Array(vertexCount + 1);
  for (let v = 0; v < vertexCount; v++) offsets[v + 1] = offsets[v] + degree[v];

  const cursor = offsets.slice(0, vertexCount);
  const adjacent = new Int32Array(offsets[vertexCount]);
  for (let t = 0; t < index.length; t += 3) {
    const a = index[t];
    const b = index[t + 1];
    const c = index[t + 2];
    adjacent[cursor[a]++] = b;
    adjacent[cursor[a]++] = c;
    adjacent[cursor[b]++] = a;
    adjacent[cursor[b]++] = c;
    adjacent[cursor[c]++] = a;
    adjacent[cursor[c]++] = b;
  }

  return { offsets, adjacent };
}

function smoothAreaLabels(labels: Int16Array, index: ArrayLike<number>, vertexCount: number) {
  const { offsets, adjacent } = buildAdjacency(index, vertexCount);

  let current = labels;
  const counts = new Int32Array(AREA_SLUGS.length);
  for (let iter = 0; iter < SMOOTH_ITERATIONS; iter++) {
    const next = new Int16Array(vertexCount);
    for (let v = 0; v < vertexCount; v++) {
      counts.fill(0);
      counts[current[v]]++;
      for (let e = offsets[v]; e < offsets[v + 1]; e++) counts[current[adjacent[e]]]++;
      let best = 0;
      let bestCount = -1;
      for (let k = 0; k < counts.length; k++) {
        if (counts[k] > bestCount) {
          bestCount = counts[k];
          best = k;
        }
      }
      next[v] = best;
    }
    current = next;
  }
  return current;
}

function useBrainSTLGeometry() {
  const raw = useLoader(STLLoader, "/models/brain.stl");

  return useMemo(() => {
    const merged = mergeVertices(raw, 1e-4);
    const pos = merged.attributes.position;
    const values = pos.array as Float32Array;

    const boundsX = percentileBounds(values, 3, 0, TRIM_PERCENTILE);
    const boundsY = percentileBounds(values, 3, 1, TRIM_PERCENTILE);
    const boundsZ = percentileBounds(values, 3, 2, TRIM_PERCENTILE);

    // Engine axes: x (left-right) <- raw Y, y (up) <- raw Z, z (front) <- raw X.
    const engineHalfExtent = {
      x: boundsY.halfExtent,
      y: boundsZ.halfExtent,
      z: boundsX.halfExtent,
    };
    const scale = TARGET_HALF_EXTENT / Math.max(engineHalfExtent.x, engineHalfExtent.y, engineHalfExtent.z);

    const finalPos = new Float32Array(pos.count * 3);
    const rawLabels = new Int16Array(pos.count);

    for (let i = 0; i < pos.count; i++) {
      const rx = pos.getX(i) - boundsX.center;
      const ry = pos.getY(i) - boundsY.center;
      const rz = pos.getZ(i) - boundsZ.center;

      const ex = AXIS_SIGN[0] * ry * scale;
      const ey = AXIS_SIGN[1] * rz * scale;
      const ez = AXIS_SIGN[2] * rx * scale;

      finalPos[i * 3] = ex;
      finalPos[i * 3 + 1] = ey;
      finalPos[i * 3 + 2] = ez;

      const len = Math.hypot(ex, ey, ez) || 1;
      const area = nearestBrainArea([ex / len, ey / len, ez / len]);
      rawLabels[i] = AREA_SLUGS.indexOf(area.slug);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(finalPos, 3));
    const index = merged.getIndex();
    if (index) geometry.setIndex(index);
    geometry.computeVertexNormals();

    const idxArray = geometry.index?.array;
    const labels = idxArray ? smoothAreaLabels(rawLabels, idxArray, pos.count) : rawLabels;

    const colors = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const [r, g, b] = AREA_COLOR[BRAIN_AREAS[labels[i]].slug];
      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Boundary lines: one segment per triangle edge whose two endpoints
    // belong to different (smoothed) areas, so the color regions read as
    // distinct zones with a clean edge rather than a soft-edged texture.
    const boundaryPositions: number[] = [];
    if (idxArray) {
      const normalAttr = geometry.attributes.normal;
      const seen = new Set<number>();
      const vertexCount = pos.count;
      const pushEdge = (a: number, b: number) => {
        const key = a < b ? a * vertexCount + b : b * vertexCount + a;
        if (seen.has(key)) return;
        seen.add(key);
        for (const v of [a, b]) {
          boundaryPositions.push(
            finalPos[v * 3] + normalAttr.getX(v) * BOUNDARY_OFFSET,
            finalPos[v * 3 + 1] + normalAttr.getY(v) * BOUNDARY_OFFSET,
            finalPos[v * 3 + 2] + normalAttr.getZ(v) * BOUNDARY_OFFSET,
          );
        }
      };
      for (let t = 0; t < idxArray.length; t += 3) {
        const a = idxArray[t];
        const b = idxArray[t + 1];
        const c = idxArray[t + 2];
        if (labels[a] !== labels[b]) pushEdge(a, b);
        if (labels[b] !== labels[c]) pushEdge(b, c);
        if (labels[c] !== labels[a]) pushEdge(c, a);
      }
    }

    const boundaryGeometry = new THREE.BufferGeometry();
    boundaryGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(boundaryPositions), 3),
    );

    return { geometry, boundaryGeometry, scale };
  }, [raw]);
}

// Cerebellum: a separate real anatomical mesh (BodyParts3D, via Wikimedia
// Commons — see /public/models/README.md), scaled with the same mm-to-scene
// factor as the main brain so its size stays anatomically proportional.
function useCerebellumGeometry(scale: number) {
  const raw = useLoader(STLLoader, "/models/cerebellum.stl");

  return useMemo(() => {
    const merged = mergeVertices(raw, 1e-4);
    merged.computeBoundingBox();
    const bb = merged.boundingBox!;
    const cx = (bb.min.x + bb.max.x) / 2;
    const cy = (bb.min.y + bb.max.y) / 2;
    const cz = (bb.min.z + bb.max.z) / 2;

    const pos = merged.attributes.position;
    const finalPos = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const rx = pos.getX(i) - cx;
      const ry = pos.getY(i) - cy;
      const rz = pos.getZ(i) - cz;
      // Engine axes for this file: x (left-right) <- raw X, y (up) <- raw Z,
      // z (front) <- raw Y.
      finalPos[i * 3] = rx * scale;
      finalPos[i * 3 + 1] = rz * scale;
      finalPos[i * 3 + 2] = ry * scale;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(finalPos, 3));
    const index = merged.getIndex();
    if (index) geometry.setIndex(index);
    geometry.computeVertexNormals();
    return geometry;
  }, [raw, scale]);
}

// Distinct from every brain-area color so the cerebellum reads as its own
// structure rather than blending into the motor area's zone.
const CEREBELLUM_COLOR = "#14b8a6";

function Cerebellum({ scale }: { scale: number }) {
  const geometry = useCerebellumGeometry(scale);

  return (
    <group position={[0, -1.1, -1.35]} scale={1.15}>
      <mesh geometry={geometry} renderOrder={1}>
        <meshStandardMaterial color={CEREBELLUM_COLOR} roughness={0.4} metalness={0} depthTest={false} />
      </mesh>
    </group>
  );
}

function AreaLabels({ accentColor }: { accentColor: string }) {
  return (
    <>
      {BRAIN_AREAS.map((area) => (
        <Billboard key={area.slug} position={area.anchor}>
          <Text
            fontSize={0.11}
            color={accentColor}
            anchorX="center"
            anchorY="middle"
            fillOpacity={0.5}
          >
            {area.label}
          </Text>
        </Billboard>
      ))}
    </>
  );
}

function Node({
  node,
  position,
  selected,
  onToggle,
}: {
  node: GraphNode;
  position: [number, number, number];
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <group position={position}>
      <mesh
        renderOrder={1}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        <sphereGeometry args={[selected ? 0.095 : 0.07, 16, 16]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={selected ? 1.3 : 0.9}
        />
      </mesh>
      {/* Thin dark ring so the dot reads clearly against any background color. */}
      <mesh renderOrder={0}>
        <sphereGeometry args={[selected ? 0.115 : 0.088, 16, 16]} />
        <meshBasicMaterial color="black" />
      </mesh>
      {/* Larger invisible target so nodes stay easy to hit on touch screens. */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        visible={false}
      >
        <sphereGeometry args={[0.18, 8, 8]} />
      </mesh>
      {selected && (
        <Html center distanceFactor={6} style={{ pointerEvents: "auto" }}>
          <a
            href={node.href}
            className="whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-xs font-medium text-white no-underline"
          >
            {node.title}
          </a>
        </Html>
      )}
    </group>
  );
}

function Connections({
  links,
  positions,
  selectedId,
  accentColor,
}: {
  links: GraphLink[];
  positions: Map<string, [number, number, number]>;
  selectedId: string | null;
  accentColor: string;
}) {
  if (selectedId == null) return null;

  return (
    <>
      {links.map((link) => {
        if (link.source !== selectedId && link.target !== selectedId) return null;
        const source = positions.get(link.source);
        const target = positions.get(link.target);
        if (!source || !target) return null;

        return (
          <Line
            key={link.id}
            points={[source, target]}
            color={accentColor}
            transparent
            opacity={0.9}
            lineWidth={1.5}
          />
        );
      })}
    </>
  );
}

// Casts from well outside the mesh back toward the center and keeps the
// first hit, so the true outer surface is found even where the shell dips
// inward locally (a ray cast outward from the origin can miss that, or hit
// an inner fold first, on a mesh this irregular).
function useSurfaceRaycaster(geometry: THREE.BufferGeometry) {
  return useMemo(() => {
    const mesh = new THREE.Mesh(geometry);
    const raycaster = new THREE.Raycaster();
    const farPoint = new THREE.Vector3();
    const inward = new THREE.Vector3();
    return (dir: THREE.Vector3) => {
      farPoint.copy(dir).multiplyScalar(TARGET_HALF_EXTENT * 4);
      inward.copy(dir).multiplyScalar(-1);
      raycaster.set(farPoint, inward);
      const hits = raycaster.intersectObject(mesh, false);
      return hits.length ? hits[0].point : dir.clone().multiplyScalar(TARGET_HALF_EXTENT);
    };
  }, [geometry]);
}

function SceneContent({
  nodes,
  links,
  accentColor,
  selectedNodeId,
  onSelectNode,
  onSelectArea,
  onMissed,
}: {
  nodes: GraphNode[];
  links: GraphLink[];
  accentColor: string;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  onSelectArea: (slug: BrainAreaSlug) => void;
  onMissed: () => void;
}) {
  const { geometry, boundaryGeometry, scale } = useBrainSTLGeometry();
  const raycastSurface = useSurfaceRaycaster(geometry);

  const positions = useMemo(() => {
    const map = new Map<string, [number, number, number]>();
    const dir = new THREE.Vector3();
    for (const node of nodes) {
      const [dx, dy, dz] = nodeDirection(node.id, node.brainArea);
      dir.set(dx, dy, dz).normalize();
      const surfacePoint = raycastSurface(dir);
      map.set(node.id, [
        surfacePoint.x + dir.x * NODE_SURFACE_OFFSET,
        surfacePoint.y + dir.y * NODE_SURFACE_OFFSET,
        surfacePoint.z + dir.z * NODE_SURFACE_OFFSET,
      ]);
    }
    return map;
  }, [nodes, raycastSurface]);

  function handleClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation();
    const local = (e.object as THREE.Mesh).worldToLocal(e.point.clone());
    const area = nearestBrainArea([local.x, local.y, local.z]);
    onSelectArea(area.slug);
  }

  return (
    <group onPointerMissed={onMissed}>
      <mesh geometry={geometry} onClick={handleClick}>
        <meshStandardMaterial vertexColors roughness={0.4} metalness={0} side={THREE.DoubleSide} />
      </mesh>
      <lineSegments geometry={boundaryGeometry}>
        <lineBasicMaterial color="black" />
      </lineSegments>
      <Cerebellum scale={scale} />
      <Suspense fallback={null}>
        <AreaLabels accentColor={accentColor} />
      </Suspense>
      <Connections
        links={links}
        positions={positions}
        selectedId={selectedNodeId}
        accentColor={accentColor}
      />
      {nodes.map((node) => {
        const position = positions.get(node.id);
        if (!position) return null;
        return (
          <Node
            key={node.id}
            node={node}
            position={position}
            selected={node.id === selectedNodeId}
            onToggle={() => onSelectNode(node.id)}
          />
        );
      })}
    </group>
  );
}

function useAccentColor() {
  const [accent] = useState(() => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue("--accent")
      .trim();
    return value || "#3b82f6";
  });
  return accent;
}

export function BrainGraph({
  nodes,
  links,
}: {
  nodes: GraphNode[];
  links: GraphLink[];
}) {
  const accentColor = useAccentColor();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedAreaSlug, setSelectedAreaSlug] = useState<BrainAreaSlug | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  function selectNode(id: string) {
    setSelectedNodeId((prev) => (prev === id ? null : id));
    setSelectedAreaSlug(null);
  }

  function selectArea(slug: BrainAreaSlug) {
    setSelectedAreaSlug((prev) => (prev === slug ? null : slug));
    setSelectedNodeId(null);
  }

  function clearSelection() {
    setSelectedNodeId(null);
    setSelectedAreaSlug(null);
  }

  const selectedArea = selectedAreaSlug ? getBrainArea(selectedAreaSlug) : null;
  const areaNodes = useMemo(() => {
    if (!selectedAreaSlug) return [];
    return nodes.filter(
      (node) => resolveBrainArea(node.id, node.brainArea).slug === selectedAreaSlug,
    );
  }, [nodes, selectedAreaSlug]);

  const rotating = autoRotate && selectedNodeId == null && selectedAreaSlug == null;

  return (
    <div>
      <div className="mx-auto aspect-[4/3] w-full max-w-2xl">
        <Canvas
          flat
          camera={{ position: [0, 0.4, 3.8], fov: 45 }}
          gl={{ alpha: true, antialias: true }}
          dpr={[1, 1.5]}
        >
          <ambientLight intensity={1.25} />
          <directionalLight position={[2, 3, 2]} intensity={0.8} />
          <directionalLight position={[-2, -1, -2]} intensity={0.45} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={rotating}
            autoRotateSpeed={AUTO_ROTATE_SPEED}
            onStart={() => setAutoRotate(false)}
          />
          <Suspense fallback={null}>
            <SceneContent
              nodes={nodes}
              links={links}
              accentColor={accentColor}
              selectedNodeId={selectedNodeId}
              onSelectNode={selectNode}
              onSelectArea={selectArea}
              onMissed={clearSelection}
            />
          </Suspense>
        </Canvas>
      </div>

      <div className="mx-auto mt-3 flex max-w-2xl justify-center">
        <button
          type="button"
          onClick={() => setAutoRotate((v) => !v)}
          className="rounded-full border border-black/[.12] px-3 py-1 text-xs text-muted hover:border-black/[.3] dark:border-white/[.16] dark:hover:border-white/[.4]"
        >
          {autoRotate ? "Ferma la rotazione" : "Riprendi la rotazione"}
        </button>
      </div>

      {selectedArea && (
        <div className="mx-auto mt-4 max-w-2xl rounded-lg border border-black/[.08] p-4 text-sm dark:border-white/[.12]">
          <p className="font-medium" style={{ color: selectedArea.color }}>
            {selectedArea.label}
          </p>
          <p className="mt-1 text-muted">{selectedArea.description}</p>
          {areaNodes.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {areaNodes.map((node) => (
                <li key={node.id}>
                  <Link
                    href={node.href}
                    className="rounded-full border border-black/[.12] px-3 py-1 text-xs hover:border-black/[.3] dark:border-white/[.16] dark:hover:border-white/[.4]"
                  >
                    {node.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default BrainGraph;
