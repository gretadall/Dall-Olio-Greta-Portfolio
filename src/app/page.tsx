import Image from "next/image";
import Link from "next/link";
import {
  getSiteSettings,
  getPublishedSections,
  getPublishedEntriesForSections,
  getPublishedTravelPins,
  getPublishedBlogPostsPage,
  getPersonalPhotos,
  type PersonalPhoto,
} from "@/lib/queries";
import { getMediaUrl } from "@/lib/supabase/media";
import { formatItalianDate, formatPeriod } from "@/lib/format-date";
import { gmailComposeUrl } from "@/lib/contact";
import { sanitizeEntryBody } from "@/lib/sanitize";
import type { Database } from "@/lib/supabase/types";
import { EditableText } from "@/components/edit/EditableText";
import { Eyebrow, HomeSection, MoreLink, SectionHeader } from "@/components/home/SectionHeader";
import { MiniGlobe } from "@/components/home/MiniGlobe";
import { PhotoMarquee, WordMarquee } from "@/components/home/Marquees";
import { EntryCard } from "@/components/EntryCard";

type Section = Database["public"]["Tables"]["sections"]["Row"];
type Entry = Database["public"]["Tables"]["entries"]["Row"];

const ROMAN = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii"];

const byNewest = (a: Entry, b: Entry) =>
  (b.period_start ?? "").localeCompare(a.period_start ?? "");

// "E sono un mix di tante cose. Innovazione, comunicazione, sport." → the list
// after the first sentence, used for the sliding band of words.
function wordsFromTagline(tagline: string | null) {
  const list = tagline?.split(".").find((part) => part.includes(","));
  return (list ?? "")
    .split(",")
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean);
}

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

function Polaroid({
  photo,
  className,
  tilt,
  delay,
}: {
  photo: PersonalPhoto;
  className: string;
  tilt: string;
  delay: string;
}) {
  return (
    <Link
      href={photo.href}
      className={`animate-float absolute z-10 block w-36 rounded-lg bg-[#f6f1ee] p-2 pb-2.5 text-black shadow-2xl transition-transform hover:scale-105 sm:w-44 ${className}`}
      style={{ ["--tilt" as string]: tilt, animationDelay: delay }}
    >
      <span className="relative block aspect-square overflow-hidden rounded">
        <Image src={getMediaUrl(photo.path)} alt={photo.alt} fill sizes="176px" className="object-cover" />
      </span>
      <span className="mt-2 block truncate px-0.5 font-serif text-xs italic">{photo.title}</span>
    </Link>
  );
}

export default async function Home() {
  const [settings, sections, pins, blog, photos] = await Promise.all([
    getSiteSettings(),
    getPublishedSections(),
    getPublishedTravelPins(),
    getPublishedBlogPostsPage({ page: 1, pageSize: 3 }),
    getPersonalPhotos(),
  ]);

  const entries = await getPublishedEntriesForSections(sections.map((s) => s.id));
  const section = (slug: string) => sections.find((s) => s.slug === slug) ?? null;
  const entriesOf = (s: Section | null) => (s ? entries.filter((e) => e.section_id === s.id) : []);
  const coverOf = (entryId: string) => photos.find((p) => p.entryId === entryId)?.path ?? null;

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

  // Two snapshots around the portrait: one from sport if there is one, then
  // one from a different story.
  const firstPolaroid = photos.find((p) => p.href.startsWith("/sport/")) ?? photos[0];
  const secondPolaroid = photos.find(
    (p) => p !== firstPolaroid && p.href.split("/")[1] !== firstPolaroid?.href.split("/")[1]
  );

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="animate-drift pointer-events-none absolute -top-40 -left-40 h-[36rem] w-[36rem] rounded-full bg-primary/25 blur-[120px]"
        />
        <div className="relative mx-auto grid max-w-6xl gap-16 px-5 pt-14 pb-20 sm:px-8 sm:pt-20 sm:pb-24 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div>
            <div className="enter">
              <Eyebrow>oltre il CV</Eyebrow>
            </div>
            <h1
              className="enter mt-6 text-5xl leading-[1.02] font-semibold tracking-tight sm:text-7xl"
              style={{ ["--delay" as string]: "80ms" }}
            >
              Ciao, sono
              <br />
              <span className="font-serif font-normal text-primary italic">
                <EditableText
                  value={settings.owner_name ?? "Greta"}
                  target={{ table: "site_settings", field: "owner_name" }}
                />
                .
              </span>
            </h1>
            {settings.tagline && (
              <div className="enter" style={{ ["--delay" as string]: "160ms" }}>
                <EditableText
                  as="p"
                  className="mt-6 max-w-xl text-lg leading-relaxed text-muted"
                  value={settings.tagline}
                  target={{ table: "site_settings", field: "tagline" }}
                  multiline
                />
              </div>
            )}
            <div className="enter mt-10 flex flex-wrap gap-3" style={{ ["--delay" as string]: "240ms" }}>
              <a
                href="#progetti"
                className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.03]"
              >
                Scopri cosa ho costruito
              </a>
              <Link
                href="/chi-sono"
                className="rounded-full border border-line px-6 py-3 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
              >
                Chi sono
              </Link>
            </div>
          </div>

          {settings.hero_photo_path && (
            <div className="enter relative mx-auto w-full max-w-sm md:max-w-none" style={{ ["--delay" as string]: "200ms" }}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-line">
                <Image
                  src={getMediaUrl(settings.hero_photo_path)}
                  alt={settings.owner_name ?? settings.site_title}
                  fill
                  priority
                  sizes="(min-width: 768px) 40vw, 90vw"
                  className="object-cover"
                />
              </div>
              {firstPolaroid && (
                <Polaroid photo={firstPolaroid} className="-bottom-8 -left-6 sm:-left-12" tilt="-7deg" delay="0s" />
              )}
              {secondPolaroid && (
                <Polaroid photo={secondPolaroid} className="-top-6 -right-4 hidden sm:block" tilt="6deg" delay="-3s" />
              )}
            </div>
          )}
        </div>
      </section>

      <WordMarquee words={wordsFromTagline(settings.tagline)} />

      {/* Vision & valori */}
      {(settings.vision_text || valori) && (
        <HomeSection id="vision">
          <SectionHeader
            label="vision e valori"
            title={
              <>
                Ciò in cui <em className="text-primary">credo</em>.
              </>
            }
            more={valori && <MoreLink href={`/${valori.slug}`}>I miei valori</MoreLink>}
          />
          <div className="mt-14 grid gap-12 md:grid-cols-[1fr_1.1fr]">
            {settings.vision_text && (
              <div
                className="rich-content reveal text-lg leading-relaxed [&_p:first-child]:mt-0"
                dangerouslySetInnerHTML={{ __html: sanitizeEntryBody(settings.vision_text) }}
              />
            )}
            {valori && (
              <div>
                <div className="text-sm text-muted">
                  <SectionDescription section={valori} />
                </div>
                <ol className="mt-6 grid gap-3 sm:grid-cols-2">
                  {entriesOf(valori).map((entry, i) => (
                    <li key={entry.id} className="reveal">
                      <Link
                        href={`/${valori.slug}/${entry.slug}`}
                        className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-primary/60"
                      >
                        <span className="font-serif text-2xl text-primary italic">{ROMAN[i] ?? i + 1}.</span>
                        <span className="mt-3 block font-semibold">{entry.title}</span>
                        {entry.description && (
                          <span className="mt-1 line-clamp-3 block text-sm text-muted">{entry.description}</span>
                        )}
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
            label={progetti.title.toLowerCase()}
            title={
              <>
                Cose che ho <em className="text-primary">costruito</em>.
              </>
            }
            subtitle={<SectionDescription section={progetti} />}
            more={<MoreLink href={`/${progetti.slug}`}>Tutti i progetti</MoreLink>}
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {entriesOf(progetti)
              .slice(0, 3)
              .map((entry) => (
                <EntryCard
                  key={entry.id}
                  sectionSlug={progetti.slug}
                  entry={entry}
                  cover={coverOf(entry.id)}
                />
              ))}
          </div>
        </HomeSection>
      )}

      {/* Foto */}
      {photos.length > 0 && (
        <section>
          <div className="mx-auto max-w-6xl px-5 pt-8 sm:px-8">
            <SectionHeader
              label="dal vivo"
              title={
                <>
                  Qualche <em className="text-primary">momento</em>.
                </>
              }
              subtitle="Passaci sopra per fermarle, cliccane una per leggere la storia."
            />
          </div>
          <PhotoMarquee photos={photos} />
        </section>
      )}

      {/* Percorso */}
      {percorso.length > 0 && (
        <HomeSection id="percorso">
          <SectionHeader
            label="percorso"
            title={
              <>
                La strada <em className="text-primary">fin qui</em>.
              </>
            }
            subtitle="Esperienze e formazione, dalla più recente."
            more={
              <div className="flex flex-wrap gap-2">
                {esperienze && <MoreLink href={`/${esperienze.slug}`}>Esperienze</MoreLink>}
                {formazione && <MoreLink href={`/${formazione.slug}`}>Formazione</MoreLink>}
              </div>
            }
          />
          <ol className="relative mt-14 ml-2 border-l border-line">
            {percorso.map(({ section: s, entry }) => (
              <li key={entry.id} className="reveal relative pb-10 pl-8 last:pb-0">
                <span
                  aria-hidden
                  className="absolute top-1.5 -left-[7px] h-3.5 w-3.5 rounded-full border-2 border-background bg-primary shadow-[0_0_0_4px_color-mix(in_srgb,var(--primary)_25%,transparent)]"
                />
                <Link href={`/${s.slug}/${entry.slug}`} className="group block max-w-2xl">
                  <span className="text-xs font-medium tracking-[0.14em] text-muted uppercase tabular-nums">
                    {formatPeriod(entry.period_start, entry.period_end)}
                  </span>
                  <span className="mt-1 block text-xl font-semibold tracking-tight transition-colors group-hover:text-primary">
                    {entry.title}
                  </span>
                  <span className="mt-1 block text-sm text-muted">
                    {[s.title, entry.location].filter(Boolean).join(" · ")}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </HomeSection>
      )}

      {/* Viaggi */}
      {viaggi && (
        <HomeSection id="viaggi">
          <div className="reveal relative overflow-hidden rounded-[2rem] border border-line">
            {viaggi.background_image_path && (
              <Image
                src={getMediaUrl(viaggi.background_image_path)}
                alt=""
                fill
                sizes="(min-width: 1152px) 1152px, 100vw"
                className="object-cover object-right opacity-70"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/10" />
            <div className="relative grid items-center gap-10 p-6 sm:p-12 md:grid-cols-[1.1fr_1fr]">
              <div>
                <Eyebrow>{viaggi.title.toLowerCase()}</Eyebrow>
                <h2 className="mt-4 font-serif text-4xl leading-[1.1] sm:text-5xl">
                  Il mondo, <em className="text-primary">un posto alla volta</em>.
                </h2>
                <div className="mt-4 text-muted">
                  <SectionDescription section={viaggi} />
                </div>
                <dl className="mt-8 flex gap-10">
                  <div>
                    <dt className="text-xs font-medium tracking-[0.14em] text-muted uppercase">Paesi</dt>
                    <dd className="mt-1 font-serif text-5xl">{countries}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium tracking-[0.14em] text-muted uppercase">Tappe</dt>
                    <dd className="mt-1 font-serif text-5xl">{pins.length}</dd>
                  </div>
                </dl>
                {recentTrips.length > 0 && (
                  <ul className="mt-8 flex flex-wrap gap-2">
                    {recentTrips.map((entry) => (
                      <li key={entry.id}>
                        <Link
                          href={`/${viaggi.slug}/${entry.slug}`}
                          className="inline-block rounded-full border border-line bg-background/60 px-3.5 py-1.5 text-sm backdrop-blur transition-colors hover:border-primary hover:text-primary"
                        >
                          {entry.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  href={`/${viaggi.slug}`}
                  className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.03]"
                >
                  Gira il globo ↗
                </Link>
              </div>
              <Link
                href={`/${viaggi.slug}`}
                className="mx-auto block w-full max-w-[340px] transition-transform duration-700 hover:rotate-6"
                aria-label="Apri il globo dei viaggi"
              >
                <MiniGlobe pins={pins} />
              </Link>
            </div>
          </div>
        </HomeSection>
      )}

      {/* Sport, passioni, lingue */}
      {beyond.length > 0 && (
        <HomeSection id="oltre">
          <SectionHeader
            label="fuori dal lavoro"
            title={
              <>
                Quello che mi forma, <em className="text-primary">ogni giorno</em>.
              </>
            }
          />
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {beyond.map((s) => (
              <div
                key={s.id}
                className="group reveal flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-colors hover:border-primary/60"
              >
                {s.background_image_path && (
                  <Link href={`/${s.slug}`} className="relative block aspect-[16/10] overflow-hidden" tabIndex={-1}>
                    <Image
                      src={getMediaUrl(s.background_image_path)}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </Link>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-3">
                    {s.icon && <span aria-hidden className="text-xl">{s.icon}</span>}
                    <h3 className="font-serif text-2xl">{s.title}</h3>
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
              </div>
            ))}
          </div>
        </HomeSection>
      )}

      {/* Blog */}
      {blog.posts.length > 0 && (
        <HomeSection id="blog">
          <SectionHeader
            label="blog"
            title={
              <>
                Pensieri messi <em className="text-primary">per iscritto</em>.
              </>
            }
            more={<MoreLink href="/blog">Tutti gli articoli</MoreLink>}
          />
          <ul className="mt-14 divide-y divide-line border-y border-line">
            {blog.posts.map((post) => (
              <li key={post.id} className="reveal">
                <Link href={`/blog/${post.slug}`} className="group grid gap-1 py-6 sm:grid-cols-[12rem_1fr] sm:gap-8">
                  <span className="text-xs font-medium text-muted tabular-nums">
                    {post.published_at ? formatItalianDate(post.published_at) : ""}
                  </span>
                  <span>
                    <span className="block font-serif text-2xl transition-colors group-hover:text-primary">
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
        <div className="reveal relative overflow-hidden rounded-[2rem] border border-primary/30 bg-primary/10 px-6 py-16 text-center sm:px-12 sm:py-20">
          <div
            aria-hidden
            className="animate-drift pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-primary/30 blur-[100px]"
          />
          <div className="relative">
            <div className="flex justify-center">
              <Eyebrow>contatti</Eyebrow>
            </div>
            <h2 className="mx-auto mt-5 max-w-2xl font-serif text-4xl leading-[1.1] sm:text-6xl">
              Hai un&apos;idea? <em className="text-primary">Parliamone</em>.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-muted">
              Un progetto da costruire, una collaborazione o anche solo una curiosità: scrivimi.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {settings.contact_email && (
                <a
                  href={gmailComposeUrl(settings.contact_email)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.03]"
                >
                  Scrivimi ↗
                </a>
              )}
              {settings.linkedin_url && (
                <a
                  href={settings.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-line bg-background/40 px-6 py-3 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
                >
                  LinkedIn ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </HomeSection>
    </>
  );
}
