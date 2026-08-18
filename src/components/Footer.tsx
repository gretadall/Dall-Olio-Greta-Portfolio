export function Footer({ text }: { text: string }) {
  return (
    <footer className="border-t border-black/[.08] dark:border-white/[.145]">
      <div className="mx-auto max-w-4xl px-6 py-8 text-sm text-muted">
        {text}
      </div>
    </footer>
  );
}
