"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";
import { Canvas, useLoader, type ThreeEvent } from "@react-three/fiber";
import { Billboard, Line, OrbitControls, Text } from "@react-three/drei";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
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
// Smoothing passes for the per-vertex area assignment: the raw scan mesh is
// dense and irregular, so a hard nearest-area cut through it zigzags along
// individual triangle edges. Repeatedly relabeling each vertex to match the
// majority of its neighbors erodes that into a smooth, rounded boundary.
const SMOOTH_ITERATIONS = 14;
// The source scans are far denser than this scene needs (the brain STL has
// ~82k triangles, the cerebellum ~48k) — full resolution was the main cause
// of choppy rotation/dragging. Snapping vertices to a coarse grid (in the
// STL's raw mm units) and dropping the triangles that collapse to a point
// decimates both in well under 100ms; three.js's own SimplifyModifier was
// tried first and took *minutes* on this mesh size — unusable.
const BRAIN_VOXEL_MM = 4;
const CEREBELLUM_VOXEL_MM = 2;

function fastDecimate(geometry: THREE.BufferGeometry, voxelSize: number) {
  const pos = geometry.attributes.position;
  const vertexCount = pos.count;
  const keyToIndex = new Map<string, number>();
  const newPositions: number[] = [];
  const remap = new Int32Array(vertexCount);

  for (let i = 0; i < vertexCount; i++) {
    const gx = Math.round(pos.getX(i) / voxelSize);
    const gy = Math.round(pos.getY(i) / voxelSize);
    const gz = Math.round(pos.getZ(i) / voxelSize);
    const key = `${gx},${gy},${gz}`;
    let idx = keyToIndex.get(key);
    if (idx === undefined) {
      idx = newPositions.length / 3;
      newPositions.push(gx * voxelSize, gy * voxelSize, gz * voxelSize);
      keyToIndex.set(key, idx);
    }
    remap[i] = idx;
  }

  const sourceIndex = geometry.index;
  const triangleCount = sourceIndex ? sourceIndex.count / 3 : vertexCount / 3;
  const newIndices: number[] = [];
  for (let t = 0; t < triangleCount; t++) {
    const i0 = sourceIndex ? sourceIndex.getX(t * 3) : t * 3;
    const i1 = sourceIndex ? sourceIndex.getX(t * 3 + 1) : t * 3 + 1;
    const i2 = sourceIndex ? sourceIndex.getX(t * 3 + 2) : t * 3 + 2;
    const a = remap[i0];
    const b = remap[i1];
    const c = remap[i2];
    if (a !== b && b !== c && a !== c) newIndices.push(a, b, c);
  }

  const result = new THREE.BufferGeometry();
  result.setAttribute("position", new THREE.Float32BufferAttribute(newPositions, 3));
  result.setIndex(newIndices);
  return result;
}

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
    const merged = fastDecimate(raw, BRAIN_VOXEL_MM);
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

    return { geometry, scale };
  }, [raw]);
}

// Cerebellum: a separate real anatomical mesh (BodyParts3D, via Wikimedia
// Commons — see /public/models/README.md), scaled with the same mm-to-scene
// factor as the main brain so its size stays anatomically proportional.
function useCerebellumGeometry(scale: number) {
  const raw = useLoader(STLLoader, "/models/cerebellum.stl");

  return useMemo(() => {
    const merged = fastDecimate(raw, CEREBELLUM_VOXEL_MM);
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
  onToggle,
  onDragStart,
}: {
  node: GraphNode;
  position: Vec3;
  selected: boolean;
  editable: boolean;
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

  // Push the label further out along the same ray from the brain's
  // center that already places the dot correctly outside the surface
  // (rather than offsetting it sideways in screen space, which could dip
  // back under a nearby bump and get lost — a real bug this replaced).
  // Normal depth testing then hides it on the far side for free, with no
  // per-frame raycasting needed (an earlier occlusion approach that made
  // interaction noticeably choppy with ~30 of these on screen).
  const labelOffset = useMemo(() => {
    const dir = new THREE.Vector3(...position).normalize();
    return dir.multiplyScalar(0.1).toArray() as Vec3;
  }, [position]);

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
      {/* Offset applied here, outside the dot's own Billboard, so it's a
          true world-space push further along the same radial line —
          Billboard rotates its contents, which would otherwise turn this
          into a screen-space offset that can dip under a nearby bump. */}
      <group position={labelOffset}>
        <Billboard>
          {/* Always-on, small label naming the node — display only, click
              is reserved for the dot (toggles its connections). */}
          <Text
            fontSize={0.045}
            color="#ffffff"
            outlineWidth={0.005}
            outlineColor="#000000"
            anchorX="center"
            anchorY="middle"
          >
            {node.title}
          </Text>
        </Billboard>
      </group>
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
  onSavePosition: (id: string, position: Vec3) => void;
  onDraggingChange: (dragging: boolean) => void;
}) {
  const { geometry, scale } = useBrainSTLGeometry();
  const raycastSurface = useSurfaceRaycaster(geometry);
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
    <group>
      <mesh
        geometry={geometry}
        onClick={handleAreaClick}
        onPointerMove={handleShellPointerMove}
      >
        <meshStandardMaterial vertexColors roughness={0.4} metalness={0} side={THREE.DoubleSide} />
      </mesh>
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
  noteText,
}: {
  nodes: GraphNode[];
  links: GraphLink[];
  areaContent: BrainAreaContentMap;
  noteText: string;
}) {
  const accentColor = useAccentColor();
  const { editMode } = useEditMode();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedAreaSlug, setSelectedAreaSlug] = useState<BrainAreaSlug | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [positionOverrides, setPositionOverrides] = useState<Map<string, Vec3>>(new Map());
  const [brainAreaOverrides, setBrainAreaOverrides] = useState<Map<string, BrainAreaSlug>>(
    new Map(),
  );

  function selectNode(id: string) {
    setSelectedNodeId((prev) => (prev === id ? null : id));
    setSelectedAreaSlug(null);
  }

  function selectArea(slug: BrainAreaSlug) {
    setSelectedAreaSlug((prev) => (prev === slug ? null : slug));
    setSelectedNodeId(null);
  }

  async function savePosition(id: string, position: Vec3) {
    setPositionOverrides((prev) => new Map(prev).set(id, position));

    // Dropping a node into a different area's territory reassigns it there
    // too — not just the raw coordinates — so the area's node list and
    // future placement stay consistent with where it visibly ended up.
    const dir = new THREE.Vector3(...position).normalize();
    const area = nearestBrainArea([dir.x, dir.y, dir.z]).slug;
    setBrainAreaOverrides((prev) => new Map(prev).set(id, area));

    try {
      await updateEntryGraphPosition(id, position[0], position[1], position[2], area);
    } catch {
      // Position/area still applied locally for this session; the DB
      // write failing (e.g. not actually an admin) just won't persist it.
    }
  }

  const selectedContent = selectedAreaSlug ? areaContent[selectedAreaSlug] : null;
  const selectedColor = selectedAreaSlug
    ? BRAIN_AREAS.find((a) => a.slug === selectedAreaSlug)?.color
    : undefined;
  const areaNodes = useMemo(() => {
    if (!selectedAreaSlug) return [];
    return nodes.filter((node) => {
      const brainArea = brainAreaOverrides.get(node.id) ?? node.brainArea;
      return resolveBrainArea(node.id, brainArea).slug === selectedAreaSlug;
    });
  }, [nodes, selectedAreaSlug, brainAreaOverrides]);

  const rotating =
    autoRotate && !dragging && selectedNodeId == null && selectedAreaSlug == null;

  return (
    <div>
      <div className="mx-auto aspect-[4/3] w-full max-w-2xl">
        <Canvas
          flat
          camera={{ position: [0, 0.4, 3.8], fov: 45 }}
          gl={{ alpha: true, antialias: true }}
          dpr={[1, 2]}
        >
          <ambientLight intensity={1.25} />
          <directionalLight position={[2, 3, 2]} intensity={0.8} />
          <directionalLight position={[-2, -1, -2]} intensity={0.45} />
          <OrbitControls
            enabled={!dragging}
            enableDamping={false}
            rotateSpeed={0.6}
            enableZoom
            minDistance={2}
            maxDistance={7}
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
        <EditableText
          as="p"
          className="text-xs text-muted"
          value={noteText}
          target={{ table: "site_settings", field: "rete_note" }}
        />
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
