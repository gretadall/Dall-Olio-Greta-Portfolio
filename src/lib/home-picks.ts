// What the owner chose to feature on the home page (site_settings.home_picks).
// Each list is in her order; an empty list means "choose automatically".

export const HOME_PICK_KINDS = ["projects", "moments", "timeline"] as const;
export type HomePickKind = (typeof HOME_PICK_KINDS)[number];
export type HomePicks = Record<HomePickKind, string[]>;

export function isHomePickKind(value: string): value is HomePickKind {
  return (HOME_PICK_KINDS as readonly string[]).includes(value);
}

export function parseHomePicks(raw: unknown): HomePicks {
  const source = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const list = (value: unknown) =>
    Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : [];
  return {
    projects: list(source.projects),
    moments: list(source.moments),
    timeline: list(source.timeline),
  };
}

/** The picked items in the picked order, or `fallback` when nothing is picked. */
export function applyPicks<T>(items: T[], picked: string[], idOf: (item: T) => string, fallback: () => T[]) {
  if (picked.length === 0) return fallback();
  const byId = new Map(items.map((item) => [idOf(item), item]));
  const chosen = picked.map((id) => byId.get(id)).filter((item): item is T => item !== undefined);
  return chosen.length > 0 ? chosen : fallback();
}
