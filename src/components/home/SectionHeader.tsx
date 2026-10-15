import Link from "next/link";

// Small pink italic label that opens a block, e.g. "✦ vision e valori".
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 font-serif text-base text-primary italic">
      <span aria-hidden className="text-xs not-italic">✦</span>
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
      className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-line px-4 py-2 text-sm transition-colors hover:border-primary hover:text-primary"
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
  label,
  title,
  subtitle,
  more,
}: {
  label: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  more?: React.ReactNode;
}) {
  return (
    <div className="reveal flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <Eyebrow>{label}</Eyebrow>
        <h2 className="mt-4 font-serif text-4xl leading-[1.1] sm:text-5xl">{title}</h2>
        {subtitle && <div className="mt-4 text-muted">{subtitle}</div>}
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
    <section id={id}>
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">{children}</div>
    </section>
  );
}
