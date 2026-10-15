import Link from "next/link";
import { Eyebrow } from "@/components/home/SectionHeader";

// Opening block shared by every inner page: back link, label, big title, intro.
export function PageHeader({
  back,
  label,
  title,
  intro,
  children,
}: {
  back?: { href: string; label: string };
  label: React.ReactNode;
  title: React.ReactNode;
  intro?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="mx-auto w-full max-w-6xl px-5 pt-14 pb-14 sm:px-8 sm:pt-20 sm:pb-20">
      {back && (
        <Link
          href={back.href}
          className="mb-10 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          <span aria-hidden>←</span> {back.label}
        </Link>
      )}
      <Eyebrow>{label}</Eyebrow>
      <h1 className="mt-6 max-w-4xl text-4xl leading-[1.05] font-semibold tracking-tight sm:text-6xl">
        {title}
      </h1>
      {intro && <div className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{intro}</div>}
      {children}
    </header>
  );
}

export function PageBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-t border-line">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">{children}</div>
    </div>
  );
}
