export function Footer() {
  return (
    <footer className="border-t border-black/[.08] dark:border-white/[.145]">
      <div className="mx-auto max-w-4xl px-6 py-8 text-sm text-zinc-500 dark:text-zinc-400">
        Beyond CV — {new Date().getFullYear()}
      </div>
    </footer>
  );
}
