import Image from "next/image";
import Link from "next/link";
import {
  getSiteSettings,
  getPublishedSections,
  getPublishedEntriesForSections,
  getPublishedTravelPins,
  getPublishedBlogPostsPage,
} from "@/lib/queries";
import { getMediaUrl } from "@/lib/supabase/media";
import { formatItalianDate, formatPeriod } from "@/lib/format-date";
import { gmailComposeUrl } from "@/lib/contact";
import { sanitizeEntryBody } from "@/lib/sanitize";
import type { Database } from "@/lib/supabase/types";
import { EditableText } from "@/components/edit/EditableText";
import { Eyebrow, HomeSection, MoreLink, SectionHeader } from "@/components/home/SectionHeader";
import { MiniGlobe } from "@/components/home/MiniGlobe";
import { EntryCard } from "@/components/EntryCard";

type Section = Database["public"]["Tables"]["sections"]["Row"];
type Entry = Database["public"]["Tables"]["entries"]["Row"];

const byNewest = (a: Entry, b: Entry) =>
  (b.period_start ?? "").localeCompare(a.period_start ?? "");

function SectionDescription({ section }: { section: Section }) {
  if (!section.description) return null;
  return (
    <EditableText
      as="p"
      value={section.description}
      target={{ table: "sections", id: section.id, field: "description" }}
      multiline
    />
  );
}

export default async function Home() {
  const [settings, sections, pins, blog] = await Promise.all([
    getSiteSettings(),
    getPublishedSections(),
    getPublishedTravelPins(),
    getPublishedBlogPostsPage({ page: 1, pageSize: 3 }),
  ]);

  const entries = await getPublishedEntriesForSections(sections.map((s) => s.id));
  const section = (slug: string) => sections.find((s) => s.slug === slug) ?? null;
  const entriesOf = (s: Section | null) => (s ? entries.filter((e) => e.section_id === s.id) : []);

  const valori = section("valori");
  const progetti = section("progetti-personali");
  const esperienze = section("esperienze");
  const formazione = section("formazione-e-certificati");
  const viaggi = section("viaggi");
  const beyond = ["sport", "passioni", "lingue"].map(section).filter((s) => s !== null);

  const percorso = [esperienze, formazione]
    .flatMap((s) => (s ? entriesOf(s).map((entry) => ({ section: s, entry })) : []))
    .sort((a, b) => byNewest(a.entry, b.entry))
    .slice(0, 4);

  const countries = new Set(pins.map((p) => p.country).filter(Boolean)).size;
  const recentTrips = [...entriesOf(viaggi)].sort(byNewest).slice(0, 3);

  // Sections are numbered in the order they actually render, so a missing
  // one never leaves a gap in the sequence.
  let n = 0;
  const next = () => ++n;

  return (
    <>
      {/* Hero */}
      <section>
        <div className="mx-auto grid max-w-6xl gap-12 px-5 pt-16 pb-20 sm:px-8 sm:pt-24 sm:pb-28 md:grid-cols-[1.35fr_1fr] md:items-center">
          <div>
            <Eyebrow>Oltre il CV</Eyebrow>
            <h1 className="mt-6 text-5xl leading-[1.02] font-semibold tracking-tight sm:text-7xl">
              Ciao, sono{" "}
              <EditableText
                value={settings.owner_name ?? "Greta"}
                target={{ table: "site_settings", field: "owner_name" }}
              />
              <span className="text-primary">.</span>
            </h1>
            {settings.tagline && (
              <EditableText
                as="p"
                className="mt-6 max-w-xl text-lg leading-relaxed text-muted"
                value={settings.tagline}
                target={{ table: "site_settings", field: "tagline" }}
                multiline
              />
            )}
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="#progetti"
                className="rounded-md bg-foreground px-5 py-3 text-sm font-medium text-background transition-opacity hover:opacity-85"
              >
                Scopri cosa ho costruito
              </a>
              <Link
                href="/chi-sono"
                className="rounded-md border border-line px-5 py-3 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
              >
                Chi sono
              </Link>
            </div>
          </div>

          {settings.hero_photo_path && (
            <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-lg border border-line md:max-w-none">
              <Image
                src={getMediaUrl(settings.hero_photo_path)}
                alt={settings.owner_name ?? settings.site_title}
                fill
                priority
                sizes="(min-width: 768px) 40vw, 90vw"
                className="object-cover"
              />
            </div>
          )}
        </div>
      </section>

      {/* Vision & valori */}
      {(settings.vision_text || valori) && (
        <HomeSection id="vision">
          <SectionHeader
            index={next()}
            label="Vision e valori"
            title="Ciò in cui credo."
            more={valori && <MoreLink href={`/${valori.slug}`}>I miei valori</MoreLink>}
          />
          <div className="mt-14 grid gap-12 md:grid-cols-2">
            {settings.vision_text && (
              <div
                className="rich-content text-lg leading-relaxed [&_p:first-child]:mt-0"
                dangerouslySetInnerHTML={{ __html: sanitizeEntryBody(settings.vision_text) }}
              />
            )}
            {valori && (
              <div>
                <div className="text-sm text-muted">
                  <SectionDescription section={valori} />
                </div>
                <ol className="mt-6 divide-y divide-line border-y border-line">
                  {entriesOf(valori).map((entry, i) => (
                    <li key={entry.id}>
                      <Link
                        href={`/${valori.slug}/${entry.slug}`}
                        className="group flex gap-5 py-5"
                      >
                        <span className="pt-0.5 font-mono text-xs text-primary">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span>
                          <span className="block font-semibold transition-colors group-hover:text-primary">
                            {entry.title}
                          </span>
                          {entry.description && (
                            <span className="mt-1 line-clamp-2 block text-sm text-muted">
                              {entry.description}
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </HomeSection>
      )}

      {/* Progetti */}
      {progetti && (
        <HomeSection id="progetti">
          <SectionHeader
            index={next()}
            label={progetti.title}
            title="Cose che ho costruito."
            subtitle={<SectionDescription section={progetti} />}
            more={<MoreLink href={`/${progetti.slug}`}>Tutti i progetti</MoreLink>}
          />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {entriesOf(progetti)
              .slice(0, 3)
              .map((entry) => (
                <EntryCard key={entry.id} sectionSlug={progetti.slug} entry={entry} />
              ))}
          </div>
        </HomeSection>
      )}

      {/* Percorso */}
      {percorso.length > 0 && (
        <HomeSection id="percorso">
          <SectionHeader
            index={next()}
            label="Percorso"
            title="La strada fin qui."
            subtitle="Esperienze e formazione, dalla più recente."
            more={
              <div className="flex gap-6">
                {esperienze && <MoreLink href={`/${esperienze.slug}`}>Esperienze</MoreLink>}
                {formazione && <MoreLink href={`/${formazione.slug}`}>Formazione</MoreLink>}
              </div>
            }
          />
          <ul className="mt-14 divide-y divide-line border-y border-line">
            {percorso.map(({ section: s, entry }) => (
              <li key={entry.id}>
                <Link
                  href={`/${s.slug}/${entry.slug}`}
                  className="group grid gap-1 py-6 sm:grid-cols-[12rem_1fr_auto] sm:items-baseline sm:gap-8"
                >
                  <span className="font-mono text-xs text-muted">
                    {formatPeriod(entry.period_start, entry.period_end)}
                  </span>
                  <span>
                    <span className="block text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">
                      {entry.title}
                    </span>
                    <span className="mt-1 block text-sm text-muted">
                      {[s.title, entry.location].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  <span aria-hidden className="hidden text-muted transition-colors group-hover:text-primary sm:block">
                    ↗
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </HomeSection>
      )}

      {/* Viaggi */}
      {viaggi && (
        <HomeSection id="viaggi">
          <SectionHeader
            index={next()}
            label={viaggi.title}
            title="Il mondo, un posto alla volta."
            subtitle={<SectionDescription section={viaggi} />}
          />
          <div className="mt-14 grid items-center gap-10 rounded-lg border border-line bg-surface p-6 sm:p-10 md:grid-cols-[1fr_1.2fr]">
            <Link href={`/${viaggi.slug}`} className="mx-auto block w-full max-w-[320px]" aria-label="Apri il globo dei viaggi">
              <MiniGlobe pins={pins} />
            </Link>
            <div>
              <dl className="flex gap-10">
                <div>
                  <dt className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">Paesi</dt>
                  <dd className="mt-1 text-4xl font-semibold tracking-tight">{countries}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">Tappe</dt>
                  <dd className="mt-1 text-4xl font-semibold tracking-tight">{pins.length}</dd>
                </div>
              </dl>
              {recentTrips.length > 0 && (
                <ul className="mt-8 divide-y divide-line border-y border-line">
                  {recentTrips.map((entry) => (
                    <li key={entry.id}>
                      <Link
                        href={`/${viaggi.slug}/${entry.slug}`}
                        className="group flex items-baseline justify-between gap-4 py-3.5"
                      >
                        <span className="font-medium transition-colors group-hover:text-primary">
                          {entry.title}
                        </span>
                        <span className="shrink-0 font-mono text-xs text-muted">
                          {entry.period_start ? new Date(entry.period_start).getFullYear() : ""}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href={`/${viaggi.slug}`}
                className="mt-8 inline-flex rounded-md bg-foreground px-5 py-3 text-sm font-medium text-background transition-opacity hover:opacity-85"
              >
                Esplora il globo ↗
              </Link>
            </div>
          </div>
        </HomeSection>
      )}

      {/* Sport, passioni, lingue */}
      {beyond.length > 0 && (
        <HomeSection id="oltre">
          <SectionHeader
            index={next()}
            label="Fuori dal lavoro"
            title="Quello che mi forma, ogni giorno."
          />
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {beyond.map((s) => (
              <div key={s.id} className="flex flex-col rounded-lg border border-line p-6">
                <div className="flex items-center gap-3">
                  {s.icon && <span aria-hidden className="text-xl">{s.icon}</span>}
                  <h3 className="text-lg font-semibold tracking-tight">{s.title}</h3>
                </div>
                <div className="mt-2 text-sm text-muted">
                  <SectionDescription section={s} />
                </div>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {entriesOf(s).map((entry) => (
                    <li key={entry.id}>
                      <Link
                        href={`/${s.slug}/${entry.slug}`}
                        className="inline-block rounded-full border border-line px-3 py-1 text-xs transition-colors hover:border-primary hover:text-primary"
                      >
                        {entry.title}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-6">
                  <MoreLink href={`/${s.slug}`}>{s.cta_label || "Scopri tutto"}</MoreLink>
                </div>
              </div>
            ))}
          </div>
        </HomeSection>
      )}

      {/* Blog */}
      {blog.posts.length > 0 && (
        <HomeSection id="blog">
          <SectionHeader
            index={next()}
            label="Blog"
            title="Pensieri messi per iscritto."
            more={<MoreLink href="/blog">Tutti gli articoli</MoreLink>}
          />
          <ul className="mt-14 divide-y divide-line border-y border-line">
            {blog.posts.map((post) => (
              <li key={post.id}>
                <Link href={`/blog/${post.slug}`} className="group grid gap-1 py-6 sm:grid-cols-[12rem_1fr] sm:gap-8">
                  <span className="font-mono text-xs text-muted">
                    {post.published_at ? formatItalianDate(post.published_at) : ""}
                  </span>
                  <span>
                    <span className="block text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">
                      {post.title}
                    </span>
                    {post.excerpt && (
                      <span className="mt-1 line-clamp-2 block text-sm text-muted">{post.excerpt}</span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </HomeSection>
      )}

      {/* Contatti */}
      <HomeSection id="contatti">
        <Eyebrow>Contatti</Eyebrow>
        <h2 className="mt-5 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Hai un&apos;idea? Parliamone<span className="text-primary">.</span>
        </h2>
        <p className="mt-5 max-w-xl text-lg text-muted">
          Un progetto da costruire, una collaborazione o anche solo una curiosità: scrivimi.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          {settings.contact_email && (
            <a
              href={gmailComposeUrl(settings.contact_email)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-foreground px-5 py-3 text-sm font-medium text-background transition-opacity hover:opacity-85"
            >
              Scrivimi ↗
            </a>
          )}
          {settings.linkedin_url && (
            <a
              href={settings.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-line px-5 py-3 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
            >
              LinkedIn ↗
            </a>
          )}
        </div>
      </HomeSection>
    </>
  );
}
