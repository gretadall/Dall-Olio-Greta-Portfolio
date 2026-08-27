// Free positioning is temporarily disabled (caused overlap/perf issues in
// practice) — this is now an inert passthrough so every call site keeps
// working unchanged. Re-enable by restoring the drag/transform logic here.
export function Positionable({
  children,
  className,
}: {
  slotKey: string;
  target: unknown;
  position: { x: number; y: number } | null;
  children: React.ReactNode;
  className?: string;
  canvasClass?: string;
}) {
  if (!className) return <>{children}</>;
  return <div className={className}>{children}</div>;
}
