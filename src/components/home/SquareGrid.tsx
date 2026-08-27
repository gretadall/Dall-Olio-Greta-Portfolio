export function SquareGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="home-canvas relative grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
      {children}
    </div>
  );
}
