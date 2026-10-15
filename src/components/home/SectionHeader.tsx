import Link from "next/link";

// Small mono label with a pink rule, e.g. "— 02 / Progetti".
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3 font-mono text-[11px] tracking-[0.18em] text-muted uppercase">
      <span aria-hidden className="h-px w-6 bg-primary" />
      {children}
    </p>
  );
}

export function MoreLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group inline-flex shrink-0 items-center gap-1.5 text-sm text-primary"
    >
      {children}
      <span
        aria-hidden
        className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      >
        ↗
      </span>
    </Link>
  );
}

export function SectionHeader({
  index,
  label,
  title,
  subtitle,
  more,
}: {
  index: number;
  label: string;
  title: string;
  subtitle?: React.ReactNode;
  more?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <Eyebrow>
          {String(index).padStart(2, "0")} / {label}
        </Eyebrow>
        <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h2>
        {subtitle && <div className="mt-3 text-muted">{subtitle}</div>}
      </div>
      {more}
    </div>
  );
}

export function HomeSection({
  id,
  children,
}: {
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">{children}</div>
    </section>
  );
}
