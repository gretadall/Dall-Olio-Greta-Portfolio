export function VisionSquare({ text }: { text: string | null }) {
  return (
    <div className="rounded-xl border border-black/[.08] p-6 dark:border-white/[.145]">
      <h2 className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">
        Vision
      </h2>
      <div
        className="rich-content mt-3 text-sm text-muted"
        dangerouslySetInnerHTML={{
          __html: text || "<p>Contenuto in arrivo.</p>",
        }}
      />
    </div>
  );
}
