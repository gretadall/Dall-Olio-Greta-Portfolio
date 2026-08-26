import Link from "next/link";

export function LinkSquare({
  title,
  teaser,
  href,
}: {
  title: string;
  teaser: string;
  href: string | null;
}) {
  const content = (
    <>
      <h2 className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">
        {title}
      </h2>
      <p className="mt-3 text-sm text-muted">{teaser}</p>
      {href && (
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
          Scopri tutto →
        </span>
      )}
    </>
  );

  if (!href) {
    return (
      <div className="rounded-xl border border-black/[.08] p-6 dark:border-white/[.145]">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="group rounded-xl border border-black/[.08] p-6 transition-colors hover:border-black/[.16] dark:border-white/[.145] dark:hover:border-white/[.3]"
    >
      {content}
    </Link>
  );
}
