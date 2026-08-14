export function Footer({ siteTitle }: { siteTitle: string }) {
  return (
    <footer className="border-t border-black/[.08] dark:border-white/[.145]">
      <div className="mx-auto max-w-4xl px-6 py-8 text-sm text-muted">
        {siteTitle} — {new Date().getFullYear()}
      </div>
    </footer>
  );
}
