import Link from "next/link";
import Image from "next/image";
import {
  getSiteSettings,
  getPublishedSections,
  getPublishedEntriesForSections,
} from "@/lib/queries";
import { getMediaUrl } from "@/lib/supabase/media";
import { PageBody, PageHeader } from "@/components/PageHeader";

// The hub of the site: every section at a glance, each one a door to its page.
export default async function ChiSonoPage() {
  const [settings, sections] = await Promise.all([getSiteSettings(), getPublishedSections()]);
  const entries = await getPublishedEntriesForSections(sections.map((s) => s.id));

  return (
    <>
      <PageHeader
        label="chi sono"
        title={
          <>
            Tutto quello che <em className="text-primary">mi rende me</em>.
          </>
        }
        intro={settings.tagline}
        imagePath={settings.hero_photo_path}
      />

      <PageBody>
        {sections.length === 0 ? (
          <p className="text-muted">Nessuna sezione pubblicata ancora.</p>
        ) : (
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((section) => {
              const own = entries.filter((e) => e.section_id === section.id);
              return (
                <li key={section.id} className="reveal">
                  <Link
                    href={`/${section.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-[0_20px_60px_-30px_var(--primary)]"
                  >
                    {section.background_image_path && (
                      <span className="relative block aspect-[16/10] overflow-hidden">
                        <Image
                          src={getMediaUrl(section.background_image_path)}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {section.icon && (
                          <span
                            aria-hidden
                            className="absolute top-4 left-4 flex h-10 w-10 items-center justify-center rounded-full bg-background/70 text-lg backdrop-blur"
                          >
                            {section.icon}
                          </span>
                        )}
                      </span>
                    )}
                    <span className="flex flex-1 flex-col p-6">
                      <span className="font-serif text-2xl">{section.title}</span>
                      {section.description && (
                        <span className="mt-2 line-clamp-3 block text-sm leading-relaxed text-muted">
                          {section.description}
                        </span>
                      )}
                      {own.length > 0 && (
                        <span className="mt-5 flex flex-wrap gap-1.5">
                          {own.slice(0, 3).map((entry) => (
                            <span
                              key={entry.id}
                              className="max-w-full truncate rounded-full border border-line px-2.5 py-1 text-xs"
                            >
                              {entry.title}
                            </span>
                          ))}
                          {own.length > 3 && (
                            <span className="px-1 py-1 text-xs text-muted">+{own.length - 3}</span>
                          )}
                        </span>
                      )}
                      <span className="mt-auto pt-6 font-serif text-sm text-primary italic">
                        {section.cta_label || "Scopri tutto"}{" "}
                        <span aria-hidden className="inline-block not-italic transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </PageBody>
    </>
  );
}
