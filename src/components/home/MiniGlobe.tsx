// A static SVG preview of the travel globe: the real pins, projected on a
// wireframe sphere. Pure markup, no WebGL — the interactive globe only loads
// on /viaggi.

const R = 120;
const C = 140;
const LON0 = 12; // centred on Europe
const LAT0 = 38;
const rad = (d: number) => (d * Math.PI) / 180;

function project(lat: number, lng: number) {
  const phi = rad(lat);
  const lambda = rad(lng - LON0);
  const phi0 = rad(LAT0);
  const cosC =
    Math.sin(phi0) * Math.sin(phi) + Math.cos(phi0) * Math.cos(phi) * Math.cos(lambda);
  const x = C + R * Math.cos(phi) * Math.sin(lambda);
  const y =
    C -
    R * (Math.cos(phi0) * Math.sin(phi) - Math.sin(phi0) * Math.cos(phi) * Math.cos(lambda));
  // Rounded so server and browser render byte-identical markup.
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, visible: cosC > 0 };
}

// Sample a line of constant latitude or longitude into an SVG path, drawing
// only the part on the visible hemisphere.
function graticulePath(points: { lat: number; lng: number }[]) {
  let d = "";
  let pen = false;
  for (const p of points) {
    const { x, y, visible } = project(p.lat, p.lng);
    if (!visible) {
      pen = false;
      continue;
    }
    d += `${pen ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
    pen = true;
  }
  return d;
}

const range = (from: number, to: number, step: number) =>
  Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, i) => from + i * step);

const PARALLELS = range(-60, 60, 30).map((lat) =>
  graticulePath(range(-180, 180, 4).map((lng) => ({ lat, lng })))
);
const MERIDIANS = range(-180, 150, 30).map((lng) =>
  graticulePath(range(-90, 90, 4).map((lat) => ({ lat, lng })))
);

export function MiniGlobe({ pins }: { pins: { lat: number; lng: number }[] }) {
  const dots = pins.map((p) => project(p.lat, p.lng)).filter((p) => p.visible);

  return (
    <svg viewBox="0 0 280 280" className="h-auto w-full max-w-[320px]" aria-hidden>
      <defs>
        <radialGradient id="mini-globe-glow" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={C} cy={C} r={R + 14} fill="url(#mini-globe-glow)" />
      <circle cx={C} cy={C} r={R} fill="var(--background)" stroke="var(--line)" />
      <g fill="none" stroke="var(--line)" strokeWidth="0.75">
        {[...PARALLELS, ...MERIDIANS].map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      {dots.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="6" fill="var(--primary)" opacity="0.18" />
          <circle cx={p.x} cy={p.y} r="2.25" fill="var(--primary)" />
        </g>
      ))}
    </svg>
  );
}
