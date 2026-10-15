import Link from "next/link";
import Image from "next/image";
import { getMediaUrl } from "@/lib/supabase/media";
import { Eyebrow } from "@/components/home/SectionHeader";

// Opening block shared by every inner page: back link, label, big title,
// intro and, when there is one, the page's photo beside it.
export function PageHeader({
  back,
  label,
  title,
  intro,
  imagePath,
  children,
}: {
  back?: { href: string; label: string };
  label: React.ReactNode;
  title: React.ReactNode;
  intro?: React.ReactNode;
  /** Storage path of a cover photo. */
  imagePath?: string | null;
  children?: React.ReactNode;
}) {
  return (
    <header className="relative overflow-hidden">
      <div
        aria-hidden
        className="animate-drift pointer-events-none absolute -top-48 -left-48 h-[30rem] w-[30rem] rounded-full bg-primary/15 blur-[120px]"
      />
      <div
        className={`relative mx-auto grid w-full max-w-6xl gap-12 px-5 pt-12 pb-14 sm:px-8 sm:pt-16 sm:pb-20 ${
          imagePath ? "md:grid-cols-[1.3fr_1fr] md:items-end" : ""
        }`}
      >
        <div>
          {back && (
            <Link
              href={back.href}
              className="mb-10 inline-flex items-center gap-2 rounded-full border border-line px-4 py-1.5 text-sm text-muted transition-colors hover:border-primary hover:text-primary"
            >
              <span aria-hidden>←</span> {back.label}
            </Link>
          )}
          <div className="enter">
            <Eyebrow>{label}</Eyebrow>
          </div>
          <h1
            className="enter mt-5 max-w-4xl font-serif text-5xl leading-[1.05] sm:text-7xl"
            style={{ ["--delay" as string]: "80ms" }}
          >
            {title}
          </h1>
          {intro && (
            <div
              className="enter mt-6 max-w-2xl text-lg leading-relaxed text-muted"
              style={{ ["--delay" as string]: "160ms" }}
            >
              {intro}
            </div>
          )}
          {children}
        </div>
        {imagePath && (
          <div
            className="enter relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-line md:aspect-[4/5]"
            style={{ ["--delay" as string]: "200ms" }}
          >
            <Image
              src={getMediaUrl(imagePath)}
              alt=""
              fill
              priority
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
        )}
      </div>
    </header>
  );
}

export function PageBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">{children}</div>
  );
}
