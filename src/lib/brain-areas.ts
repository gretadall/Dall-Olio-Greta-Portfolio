export type BrainAreaSlug =
  | "prefrontal"
  | "linguistic"
  | "motor"
  | "limbic"
  | "hippocampus"
  | "associative";

export type BrainArea = {
  slug: BrainAreaSlug;
  label: string;
  theme: string;
  // Short, simplified neuroscience note shown when the area is clicked —
  // real function of the region, offered as the (loose) rationale for the
  // artistic placement, not a claim of scientific accuracy.
  description: string;
  // Anchor point on the surface of the stylized brain mesh; node positions
  // are this anchor plus a small deterministic jitter.
  anchor: [number, number, number];
  color: string;
};

export const BRAIN_AREAS: BrainArea[] = [
  {
    slug: "prefrontal",
    label: "Corteccia prefrontale",
    theme: "direzione, valori, decisioni",
    description:
      "Governa la pianificazione, il ragionamento a lungo termine e le decisioni orientate a un obiettivo: la zona più plausibile per i valori che guidano le scelte.",
    anchor: [0, 0.65, 1.2],
    color: "#eab308",
  },
  {
    slug: "linguistic",
    label: "Aree del linguaggio",
    theme: "linguaggio, comunicazione, insegnamento",
    description:
      "Le aree di Broca e Wernicke gestiscono produzione e comprensione del linguaggio; Broca è coinvolta anche nel decodificare le azioni altrui, un ponte plausibile con l'insegnare e allenare.",
    anchor: [-0.95, 0.05, 0.55],
    color: "#3b82f6",
  },
  {
    slug: "motor",
    label: "Area motoria & cervelletto",
    theme: "corpo, movimento, sport",
    description:
      "Corteccia motoria e cervelletto coordinano il movimento volontario, l'equilibrio e l'apprendimento dei gesti: la sede naturale di sport e attività fisica.",
    anchor: [0, -0.75, -1.25],
    color: "#22c55e",
  },
  {
    slug: "limbic",
    label: "Sistema limbico",
    theme: "passione, scoperta, motivazione emotiva",
    description:
      "Regola emozioni e motivazione, incluso l'impulso a cercare stimoli e situazioni nuove: coerente con la spinta emotiva che porta a viaggiare.",
    anchor: [0.3, -0.15, 0.15],
    color: "#ef4444",
  },
  {
    slug: "hippocampus",
    label: "Ippocampo",
    theme: "esperienze, apprendimento, memoria",
    description:
      "Consolida i ricordi a lungo termine e supporta l'apprendimento: la sede naturale delle esperienze da cui si è imparato di più.",
    anchor: [0.65, -0.55, -0.45],
    color: "#a855f7",
  },
  {
    slug: "associative",
    label: "Corteccia associativa",
    theme: "costruzione, progetti, creatività",
    description:
      "Integra informazioni provenienti da più aree per pianificare e costruire azioni complesse: coerente con progetti che uniscono competenze diverse.",
    anchor: [0, 1.0, -0.25],
    color: "#ec4899",
  },
];

export type BrainAreaContent = { label: string; description: string };
export type BrainAreaContentMap = Record<BrainAreaSlug, BrainAreaContent>;

const DEFAULT_BRAIN_AREA_CONTENT: BrainAreaContentMap = Object.fromEntries(
  BRAIN_AREAS.map((a) => [a.slug, { label: a.label, description: a.description }]),
) as BrainAreaContentMap;

// Merges admin-editable label/description rows from the `brain_areas` table
// over the static defaults above (used as a fallback before the table is
// seeded, or if a row is ever missing).
export function mergeBrainAreaContent(
  rows: { slug: string; label: string; description: string | null }[],
): BrainAreaContentMap {
  const merged = { ...DEFAULT_BRAIN_AREA_CONTENT };
  for (const row of rows) {
    if (!isBrainAreaSlug(row.slug)) continue;
    merged[row.slug] = {
      label: row.label || DEFAULT_BRAIN_AREA_CONTENT[row.slug].label,
      description: row.description ?? DEFAULT_BRAIN_AREA_CONTENT[row.slug].description,
    };
  }
  return merged;
}

const BRAIN_AREA_MAP = new Map(BRAIN_AREAS.map((a) => [a.slug, a]));

export function isBrainAreaSlug(value: string): value is BrainAreaSlug {
  return BRAIN_AREA_MAP.has(value as BrainAreaSlug);
}

export function getBrainArea(slug: BrainAreaSlug): BrainArea {
  return BRAIN_AREA_MAP.get(slug)!;
}

const AREA_DIRECTIONS = BRAIN_AREAS.map((a) => {
  const [x, y, z] = a.anchor;
  const len = Math.hypot(x, y, z) || 1;
  return [x / len, y / len, z / len] as [number, number, number];
});

// Finds the area whose anchor direction is angularly closest to the given
// direction (does not need to be normalized). Used both for coloring the
// mesh surface and for resolving a click on the shell to an area.
export function nearestBrainArea(direction: [number, number, number]): BrainArea {
  const len = Math.hypot(...direction) || 1;
  const [dx, dy, dz] = [direction[0] / len, direction[1] / len, direction[2] / len];

  let bestIndex = 0;
  let bestDot = -Infinity;
  for (let i = 0; i < AREA_DIRECTIONS.length; i++) {
    const [ax, ay, az] = AREA_DIRECTIONS[i];
    const dot = dx * ax + dy * ay + dz * az;
    if (dot > bestDot) {
      bestDot = dot;
      bestIndex = i;
    }
  }
  return BRAIN_AREAS[bestIndex];
}

// Deterministic hash so unassigned entries still land somewhere stable
// across reloads instead of all piling up in one spot.
function hashString(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function resolveBrainArea(
  entryId: string,
  brainArea: BrainAreaSlug | null,
): BrainArea {
  if (brainArea) return getBrainArea(brainArea);
  const index = hashString(entryId) % BRAIN_AREAS.length;
  return BRAIN_AREAS[index];
}

// Seeded PRNG (mulberry32) so per-node jitter is stable across renders.
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const JITTER_RADIUS = 0.25;

// Direction (not necessarily unit length) from the brain's center through a
// point near the area's anchor, jittered so nodes in the same area don't
// overlap. The caller raycasts along this direction against the actual
// loaded mesh surface to place the node visibly on top of it.
export function nodeDirection(
  entryId: string,
  brainArea: BrainAreaSlug | null,
): [number, number, number] {
  const area = resolveBrainArea(entryId, brainArea);
  const rand = mulberry32(hashString(entryId + area.slug));
  const [ax, ay, az] = area.anchor;

  // Random point inside a small sphere around the anchor.
  const u = rand();
  const v = rand();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = JITTER_RADIUS * Math.cbrt(rand());

  return [
    ax + r * Math.sin(phi) * Math.cos(theta),
    ay + r * Math.sin(phi) * Math.sin(theta),
    az + r * Math.cos(phi),
  ];
}
