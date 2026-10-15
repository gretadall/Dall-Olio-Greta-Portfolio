import Link from "next/link";
import {
  getSiteSettings,
  getPublishedSections,
  getPublishedEntriesForSections,
} from "@/lib/queries";
import { PageBody, PageHeader } from "@/components/PageHeader";

// The hub of the site: every section at a glance, each one a door to its page.
export default async function ChiSonoPage() {
  const [settings, sections] = await Promise.all([getSiteSettings(), getPublishedSections()]);
  const entries = await getPublishedEntriesForSections(sections.map((s) => s.id));

  return (
    <>
      <PageHeader
        label="Chi sono"
        title={
          <>
            Tutto quello che mi rende me<span className="text-primary">.</span>
          </>
        }
        intro={settings.tagline}
      />

      <PageBody>
        {sections.length === 0 ? (
          <p className="text-muted">Nessuna sezione pubblicata ancora.</p>
        ) : (
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((section, i) => {
              const own = entries.filter((e) => e.section_id === section.id);
              return (
                <li key={section.id}>
                  <Link
                    href={`/${section.slug}`}
                    className="group flex h-full flex-col rounded-lg border border-line bg-surface p-6 transition-colors hover:border-primary/60"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-primary">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {section.icon && <span aria-hidden className="text-xl">{section.icon}</span>}
                    </div>
                    <h2 className="mt-6 text-xl font-semibold tracking-tight">{section.title}</h2>
                    {section.description && (
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
                        {section.description}
                      </p>
                    )}
                    {own.length > 0 && (
                      <ul className="mt-5 space-y-1.5 border-t border-line pt-5 text-sm">
                        {own.slice(0, 3).map((entry) => (
                          <li key={entry.id} className="truncate">
                            {entry.title}
                          </li>
                        ))}
                        {own.length > 3 && (
                          <li className="text-muted">e altri {own.length - 3}</li>
                        )}
                      </ul>
                    )}
                    <span className="mt-auto pt-6 font-mono text-[11px] tracking-[0.14em] text-primary uppercase">
                      {section.cta_label || "Scopri tutto"}{" "}
                      <span aria-hidden className="inline-block transition-transform group-hover:translate-x-0.5">
                        →
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
