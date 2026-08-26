export function SquareGrid({ children }: { children: React.ReactNode }) {
  return (
    <section className="home-canvas relative mx-auto grid w-full max-w-4xl grid-cols-1 gap-6 px-6 pb-24 sm:grid-cols-2">
      {children}
    </section>
  );
}
