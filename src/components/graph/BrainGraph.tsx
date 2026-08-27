"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import Link from "next/link";
import * as THREE from "three";
import { Canvas, useLoader, type ThreeEvent } from "@react-three/fiber";
import { Billboard, Html, Line, OrbitControls, Text } from "@react-three/drei";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import {
  BRAIN_AREAS,
  nearestBrainArea,
  nodeDirection,
  resolveBrainArea,
} from "@/lib/brain-areas";
import type { BrainAreaContentMap, BrainAreaSlug } from "@/lib/brain-areas";
import { useEditMode } from "@/components/edit/EditModeProvider";
import { EditableText } from "@/components/edit/EditableText";
import { updateEntryGraphPosition } from "@/app/edit/actions";

export type GraphNode = {
  id: string;
  title: string;
  href: string;
  color: string;
  brainArea: BrainAreaSlug | null;
  graphX: number | null;
  graphY: number | null;
  graphZ: number | null;
};

export type GraphLink = {
  id: string;
  source: string;
  target: string;
  label: string;
  bidirectional: boolean;
};

type Vec3 = [number, number, number];

const AUTO_ROTATE_SPEED = 0.6;
const NODE_SURFACE_OFFSET = 0.05;
const CLICK_MOVE_THRESHOLD = 6; // px

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
const AXIS_SIGN: Vec3 = [1, 1, 1];

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

// Same color as the motor area (theirs is "area motoria & cervelletto"),
// so the cerebellum reads as part of that zone rather than its own.
const CEREBELLUM_COLOR = BRAIN_AREAS.find((a) => a.slug === "motor")!.color;

function Cerebellum({ scale }: { scale: number }) {
  const geometry = useCerebellumGeometry(scale);

  return (
    <group position={[0, -1.1, -1.35]} scale={1.15}>
      <mesh geometry={geometry}>
        <meshStandardMaterial color={CEREBELLUM_COLOR} roughness={0.4} metalness={0} />
      </mesh>
    </group>
  );
}

function AreaLabels({
  accentColor,
  areaContent,
}: {
  accentColor: string;
  areaContent: BrainAreaContentMap;
}) {
  return (
    <>
      {BRAIN_AREAS.map((area) => (
        <Billboard key={area.slug} position={area.anchor}>
          <Text
            fontSize={0.075}
            color={accentColor}
            anchorX="center"
            anchorY="middle"
            fillOpacity={0.55}
          >
            {areaContent[area.slug].label}
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
  editable,
  occluder,
  onToggle,
  onDragStart,
}: {
  node: GraphNode;
  position: Vec3;
  selected: boolean;
  editable: boolean;
  occluder: RefObject<THREE.Object3D | null>;
  onToggle: () => void;
  onDragStart: (screenX: number, screenY: number) => void;
}) {
  const downScreen = useRef<{ x: number; y: number } | null>(null);

  function handlePointerDown(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();
    downScreen.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY };
    if (editable) onDragStart(e.nativeEvent.clientX, e.nativeEvent.clientY);
  }

  function handlePointerUp(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();
    const start = downScreen.current;
    const moved =
      start != null &&
      Math.hypot(e.nativeEvent.clientX - start.x, e.nativeEvent.clientY - start.y) >
        CLICK_MOVE_THRESHOLD;
    if (!moved) onToggle();
  }

  const radius = selected ? 0.05 : 0.035;

  return (
    <group position={position}>
      <Billboard>
        {/* Thin dark ring so the dot reads clearly against any background color. */}
        <mesh>
          <circleGeometry args={[radius * 1.35, 24]} />
          <meshBasicMaterial color="black" />
        </mesh>
        <mesh onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}>
          <circleGeometry args={[radius, 24]} />
          <meshBasicMaterial color={node.color} />
        </mesh>
        {/* Larger invisible target so nodes stay easy to hit on touch screens. */}
        <mesh onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} visible={false}>
          <circleGeometry args={[0.14, 12]} />
        </mesh>
      </Billboard>
      {/* Always-on, small label naming the node; click to open it. A DOM
          overlay (fixed CSS pixel size, not scaled by camera distance —
          that was what made it huge) rather than WebGL text, so a nearby
          surface bump can't swallow it the way 3D-space text could.
          `occlude` raycasts against the brain shell specifically, so the
          label still disappears once the brain rotates it to the far side. */}
      <Html
        center
        position={[0, -0.09, 0]}
        occlude={[occluder as RefObject<THREE.Object3D>]}
        style={{ pointerEvents: "auto" }}
      >
        <Link
          href={node.href}
          className="whitespace-nowrap text-xs font-medium text-white no-underline"
          style={{ textShadow: "0 0 3px #000, 0 0 3px #000, 0 0 3px #000" }}
        >
          {node.title}
        </Link>
      </Html>
    </group>
  );
}

// Spherical interpolation between two direction vectors (both assumed
// already normalized).
function slerpDir(a: THREE.Vector3, b: THREE.Vector3, t: number, out: THREE.Vector3) {
  const dot = THREE.MathUtils.clamp(a.dot(b), -1, 1);
  const theta = Math.acos(dot);
  if (theta < 1e-5) return out.copy(a);
  const sinTheta = Math.sin(theta);
  const w1 = Math.sin((1 - t) * theta) / sinTheta;
  const w2 = Math.sin(t * theta) / sinTheta;
  return out.copy(a).multiplyScalar(w1).addScaledVector(b, w2);
}

// A straight chord between two surface points cuts through the opaque
// brain's interior — invisible along most of its length, and occlusion
// looks wrong as the brain rotates. Arcing over the surface instead (slerp
// the direction, lerp the radius, bulge the midpoint outward) keeps the
// connection visibly riding the shell, with normal depth testing then
// correctly hiding it once it swings around to the far side.
function arcPoints(source: Vec3, target: Vec3, segments = 20): Vec3[] {
  const a = new THREE.Vector3(...source);
  const b = new THREE.Vector3(...target);
  const ra = a.length();
  const rb = b.length();
  const da = a.clone().normalize();
  const db = b.clone().normalize();
  const dir = new THREE.Vector3();
  const points: Vec3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    slerpDir(da, db, t, dir).normalize();
    const r = THREE.MathUtils.lerp(ra, rb, t) * (1 + 0.14 * Math.sin(Math.PI * t));
    points.push([dir.x * r, dir.y * r, dir.z * r]);
  }
  return points;
}

function Connections({
  links,
  positions,
  selectedId,
  accentColor,
}: {
  links: GraphLink[];
  positions: Map<string, Vec3>;
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
            points={arcPoints(source, target)}
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
  areaContent,
  selectedNodeId,
  editable,
  positionOverrides,
  onSelectNode,
  onSelectArea,
  onMissed,
  onSavePosition,
  onDraggingChange,
}: {
  nodes: GraphNode[];
  links: GraphLink[];
  accentColor: string;
  areaContent: BrainAreaContentMap;
  selectedNodeId: string | null;
  editable: boolean;
  positionOverrides: Map<string, Vec3>;
  onSelectNode: (id: string) => void;
  onSelectArea: (slug: BrainAreaSlug) => void;
  onMissed: () => void;
  onSavePosition: (id: string, position: Vec3) => void;
  onDraggingChange: (dragging: boolean) => void;
}) {
  const { geometry, boundaryGeometry, scale } = useBrainSTLGeometry();
  const raycastSurface = useSurfaceRaycaster(geometry);
  const shellRef = useRef<THREE.Mesh>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [liveDragPos, setLiveDragPos] = useState<Vec3 | null>(null);

  const basePositions = useMemo(() => {
    const map = new Map<string, Vec3>();
    const dir = new THREE.Vector3();
    for (const node of nodes) {
      const saved =
        node.graphX != null && node.graphY != null && node.graphZ != null
          ? ([node.graphX, node.graphY, node.graphZ] as Vec3)
          : positionOverrides.get(node.id);
      if (saved) {
        map.set(node.id, saved);
        continue;
      }
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
  }, [nodes, raycastSurface, positionOverrides]);

  function startDrag(nodeId: string) {
    setDraggingId(nodeId);
    onDraggingChange(true);
  }

  function handleShellPointerMove(e: ThreeEvent<PointerEvent>) {
    if (!draggingId) return;
    e.stopPropagation();
    // Push out along the local surface normal so the dragged dot sits
    // visibly on top of the shell, same as the auto-placed ones.
    const n = e.face?.normal;
    setLiveDragPos([
      e.point.x + (n?.x ?? 0) * NODE_SURFACE_OFFSET,
      e.point.y + (n?.y ?? 0) * NODE_SURFACE_OFFSET,
      e.point.z + (n?.z ?? 0) * NODE_SURFACE_OFFSET,
    ]);
  }

  // Refs so the always-current values are visible to the window listener
  // below without re-subscribing it on every drag-move.
  const draggingIdRef = useRef(draggingId);
  const liveDragPosRef = useRef(liveDragPos);
  useEffect(() => {
    draggingIdRef.current = draggingId;
    liveDragPosRef.current = liveDragPos;
  }, [draggingId, liveDragPos]);

  function endDrag() {
    const id = draggingIdRef.current;
    const pos = liveDragPosRef.current;
    if (id && pos) onSavePosition(id, pos);
    setDraggingId(null);
    setLiveDragPos(null);
    onDraggingChange(false);
  }

  // Catch-all: a drag can end with the pointer released off the brain's
  // silhouette, where no mesh is under the cursor to fire its own
  // onPointerUp — the window listener guarantees the drag always stops.
  useEffect(() => {
    if (!draggingId) return;
    window.addEventListener("pointerup", endDrag);
    return () => window.removeEventListener("pointerup", endDrag);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draggingId]);

  function handleAreaClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation();
    const local = (e.object as THREE.Mesh).worldToLocal(e.point.clone());
    const area = nearestBrainArea([local.x, local.y, local.z]);
    onSelectArea(area.slug);
  }

  return (
    <group onPointerMissed={onMissed}>
      <mesh
        ref={shellRef}
        geometry={geometry}
        onClick={handleAreaClick}
        onPointerMove={handleShellPointerMove}
      >
        <meshStandardMaterial vertexColors roughness={0.4} metalness={0} side={THREE.DoubleSide} />
      </mesh>
      <lineSegments geometry={boundaryGeometry}>
        <lineBasicMaterial color="black" />
      </lineSegments>
      <Cerebellum scale={scale} />
      <Suspense fallback={null}>
        <AreaLabels accentColor={accentColor} areaContent={areaContent} />
      </Suspense>
      <Connections
        links={links}
        positions={basePositions}
        selectedId={selectedNodeId}
        accentColor={accentColor}
      />
      {nodes.map((node) => {
        const position =
          draggingId === node.id && liveDragPos ? liveDragPos : basePositions.get(node.id);
        if (!position) return null;
        return (
          <Node
            key={node.id}
            node={node}
            position={position}
            selected={node.id === selectedNodeId}
            editable={editable}
            occluder={shellRef}
            onToggle={() => onSelectNode(node.id)}
            onDragStart={() => startDrag(node.id)}
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
  areaContent,
}: {
  nodes: GraphNode[];
  links: GraphLink[];
  areaContent: BrainAreaContentMap;
}) {
  const accentColor = useAccentColor();
  const { editMode } = useEditMode();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedAreaSlug, setSelectedAreaSlug] = useState<BrainAreaSlug | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [positionOverrides, setPositionOverrides] = useState<Map<string, Vec3>>(new Map());

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

  async function savePosition(id: string, position: Vec3) {
    setPositionOverrides((prev) => new Map(prev).set(id, position));
    try {
      await updateEntryGraphPosition(id, position[0], position[1], position[2]);
    } catch {
      // Position still applied locally for this session; the DB write
      // failing (e.g. not actually an admin) just won't persist it.
    }
  }

  const selectedContent = selectedAreaSlug ? areaContent[selectedAreaSlug] : null;
  const selectedColor = selectedAreaSlug
    ? BRAIN_AREAS.find((a) => a.slug === selectedAreaSlug)?.color
    : undefined;
  const areaNodes = useMemo(() => {
    if (!selectedAreaSlug) return [];
    return nodes.filter(
      (node) => resolveBrainArea(node.id, node.brainArea).slug === selectedAreaSlug,
    );
  }, [nodes, selectedAreaSlug]);

  const rotating =
    autoRotate && !dragging && selectedNodeId == null && selectedAreaSlug == null;

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
            enabled={!dragging}
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
              areaContent={areaContent}
              selectedNodeId={selectedNodeId}
              editable={editMode}
              positionOverrides={positionOverrides}
              onSelectNode={selectNode}
              onSelectArea={selectArea}
              onMissed={clearSelection}
              onSavePosition={savePosition}
              onDraggingChange={setDragging}
            />
          </Suspense>
        </Canvas>
      </div>

      <div className="mx-auto mt-3 flex max-w-2xl flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <button
          type="button"
          onClick={() => setAutoRotate((v) => !v)}
          className="rounded-full border border-black/[.12] px-3 py-1 text-xs text-muted hover:border-black/[.3] dark:border-white/[.16] dark:hover:border-white/[.4]"
        >
          {autoRotate ? "Ferma la rotazione" : "Riprendi la rotazione"}
        </button>
        <p className="text-xs text-muted">
          Clicca una zona colorata per scoprire a cosa corrisponde.
        </p>
      </div>

      {selectedContent && selectedAreaSlug && (
        <div className="mx-auto mt-4 max-w-2xl rounded-lg border border-black/[.08] p-4 text-sm dark:border-white/[.12]">
          <EditableText
            as="p"
            className="font-medium"
            style={selectedColor ? { color: selectedColor } : undefined}
            value={selectedContent.label}
            target={{ table: "brain_areas", id: selectedAreaSlug, field: "label" }}
          />
          <EditableText
            as="p"
            className="mt-1 text-muted"
            value={selectedContent.description}
            target={{ table: "brain_areas", id: selectedAreaSlug, field: "description" }}
            multiline
          />
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
