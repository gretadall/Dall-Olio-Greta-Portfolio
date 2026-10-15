const MONTHS_IT = [
  "gennaio",
  "febbraio",
  "marzo",
  "aprile",
  "maggio",
  "giugno",
  "luglio",
  "agosto",
  "settembre",
  "ottobre",
  "novembre",
  "dicembre",
];

export function formatItalianDate(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  return `${d.getDate()} ${MONTHS_IT[d.getMonth()]} ${d.getFullYear()}`;
}

const MONTHS_IT_SHORT = MONTHS_IT.map((m) => m.slice(0, 3));

function formatMonthYear(input: string) {
  const d = new Date(input);
  return `${MONTHS_IT_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

// "set 2022 – oggi", "gen 2026 – giu 2026", or "" when there's no start date.
export function formatPeriod(start: string | null, end: string | null): string {
  if (!start) return "";
  return `${formatMonthYear(start)} – ${end ? formatMonthYear(end) : "oggi"}`;
}
