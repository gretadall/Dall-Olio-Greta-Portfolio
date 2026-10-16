import Image from "next/image";
import Link from "next/link";
import {
  getSiteSettings,
  getPublishedSections,
  getPublishedEntriesForSections,
  getPublishedTravelPins,
  getPublishedBlogPostsPage,
  getPersonalPhotos,
  getUiTexts,
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
import { WordMarquee } from "@/components/home/Marquees";
import { PhotoCarousel } from "@/components/home/PhotoCarousel";
import { EntryCard } from "@/components/EntryCard";
import { FlightPath } from "@/components/home/FlightPath";
import { StoryTimeline, type TimelineItem } from "@/components/home/StoryTimeline";
import { T } from "@/components/UiTexts";

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
  const [settings, sections, pins, blog, photos, texts] = await Promise.all([
    getSiteSettings(),
    getPublishedSections(),
    getPublishedTravelPins(),
    getPublishedBlogPostsPage({ page: 1, pageSize: 3 }),
    getPersonalPhotos(),
    getUiTexts(),
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

  // The steps the owner ticked "Mostra nel percorso in home" on, from any
  // section, oldest first so the year ticks forward. Until she picks any,
  // fall back to the latest few from experience, projects and education.
  const TIMELINE_FALLBACK_STEPS = 5;
  const dated = sections
    .flatMap((s) => entriesOf(s).map((entry) => ({ section: s, entry })))
    .filter(({ entry }) => entry.period_start);
  const picked = dated.filter(({ entry }) => entry.metadata?.in_timeline === true);
  const steps = picked.length
    ? picked
    : dated
        .filter(({ section: s }) => [esperienze, progetti, formazione].includes(s))
        .sort((a, b) => byNewest(a.entry, b.entry))
        .filter(({ entry }, i, all) => all.findIndex((o) => o.entry.title === entry.title) === i)
        .slice(0, TIMELINE_FALLBACK_STEPS);
  const timeline: TimelineItem[] = [...steps]
    .sort((a, b) => (a.entry.period_start ?? "").localeCompare(b.entry.period_start ?? ""))
    .map(({ section: s, entry }) => ({
      id: entry.id,
      year: new Date(entry.period_start!).getFullYear(),
      period: formatPeriod(entry.period_start, entry.period_end, texts["date.ongoing"]),
      title: entry.title,
      meta: [s.title, entry.location].filter(Boolean).join(" · "),
      href: `/${s.slug}/${entry.slug}`,
    }));

  const doors = [
    { href: "#progetti", title: "home.doors.build", text: "home.doors.buildText", image: progetti?.background_image_path },
    { href: "#viaggi", title: "home.doors.travel", text: "home.doors.travelText", image: viaggi?.background_image_path },
    { href: "#oltre", title: "home.doors.beyond", text: "home.doors.beyondText", image: beyond[0]?.background_image_path },
  ];

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
              <Eyebrow><T k="home.hero.eyebrow" /></Eyebrow>
            </div>
            <h1
              className="enter mt-6 text-5xl leading-[1.02] font-semibold tracking-tight sm:text-7xl"
              style={{ ["--delay" as string]: "80ms" }}
            >
              <T k="home.hero.greeting" />
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
                <T k="home.hero.cta" />
              </a>
              <Link
                href="/chi-sono"
                className="rounded-full border border-line px-6 py-3 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
              >
                <T k="home.hero.secondary" />
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

      <div className="flight-zone relative isolate">
      <FlightPath />

      {/* Il racconto */}
      <HomeSection id="storia">
        <div className="mx-auto max-w-3xl">
          <SectionHeader label={<T k="home.story.label" />} title={<T k="home.story.title" />} />
          <T
            as="div"
            className="reveal mt-10 text-xl leading-relaxed whitespace-pre-line text-foreground/90"
            k="home.story.body"
          />
        </div>
      </HomeSection>

      {/* Da dove vuoi iniziare */}
      <HomeSection id="inizia">
        <h2 className="reveal text-center font-serif text-4xl sm:text-5xl">
          <T k="home.doors.title" />
        </h2>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {doors.map((door, i) => (
            <a
              key={door.href}
              href={door.href}
              className="group reveal relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-[2rem] border border-line bg-surface p-6 transition-transform duration-500 hover:-translate-y-1.5"
            >
              {door.image && (
                <Image
                  src={getMediaUrl(door.image)}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover opacity-60 transition-all duration-700 group-hover:scale-105 group-hover:opacity-80"
                />
              )}
              <span className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <span className="relative font-serif text-2xl text-primary italic">{ROMAN[i]}.</span>
              <span className="relative mt-2 font-serif text-3xl">
                <T k={door.title} />
              </span>
              <span className="relative mt-1 text-sm text-muted">
                <T k={door.text} />
              </span>
              <span
                aria-hidden
                className="relative mt-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-line transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-black"
              >
                ↓
              </span>
            </a>
          ))}
        </div>
      </HomeSection>

      {/* Vision & valori */}
      {(settings.vision_text || valori) && (
        <HomeSection id="vision">
          <SectionHeader
            label={<T k="home.vision.label" />}
            title={
              <>
                <T k="home.vision.title" />
              </>
            }
            more={valori && <MoreLink href={`/${valori.slug}`}><T k="home.vision.more" /></MoreLink>}
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
                <T k="home.projects.title" />
              </>
            }
            subtitle={<SectionDescription section={progetti} />}
            more={<MoreLink href={`/${progetti.slug}`}><T k="home.projects.more" /></MoreLink>}
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
              label={<T k="home.photos.label" />}
              title={
                <>
                  <T k="home.photos.title" />
                </>
              }
              subtitle={<T k="home.photos.hint" />}
            />
          </div>
          <PhotoCarousel photos={photos} />
        </section>
      )}

      {/* Percorso */}
      {timeline.length > 0 && (
        <HomeSection id="percorso">
          <SectionHeader
            label={<T k="home.path.label" />}
            title={
              <>
                <T k="home.path.title" />
              </>
            }
            subtitle={<T k="home.path.subtitle" />}
            more={
              <div className="flex flex-wrap gap-2">
                {esperienze && <MoreLink href={`/${esperienze.slug}`}><T k="home.path.experience" /></MoreLink>}
                {formazione && <MoreLink href={`/${formazione.slug}`}><T k="home.path.education" /></MoreLink>}
              </div>
            }
          />
          <StoryTimeline items={timeline} />
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
                  <T k="home.travel.title" />
                </h2>
                <div className="mt-4 text-muted">
                  <SectionDescription section={viaggi} />
                </div>
                <dl className="mt-8 flex gap-10">
                  <div>
                    <dt className="text-xs font-medium tracking-[0.14em] text-muted uppercase"><T k="home.travel.countries" /></dt>
                    <dd className="mt-1 font-serif text-5xl">{countries}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium tracking-[0.14em] text-muted uppercase"><T k="home.travel.stops" /></dt>
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
                  <T k="home.travel.cta" />
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
            label={<T k="home.beyond.label" />}
            title={
              <>
                <T k="home.beyond.title" />
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
            label={<T k="home.blog.label" />}
            title={
              <>
                <T k="home.blog.title" />
              </>
            }
            more={<MoreLink href="/blog"><T k="home.blog.more" /></MoreLink>}
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
              <Eyebrow><T k="home.end.label" /></Eyebrow>
            </div>
            <h2 className="mx-auto mt-5 max-w-2xl font-serif text-4xl leading-[1.1] sm:text-6xl">
              <T k="home.contact.title" />
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-muted">
              <T k="home.contact.text" />
            </p>
            <p className="mx-auto mt-6 max-w-xl font-serif text-xl italic">
              <T
                k="home.end.stats"
                vars={{
                  projects: entriesOf(progetti).length,
                  countries,
                }}
              />
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {settings.contact_email && (
                <a
                  href={gmailComposeUrl(settings.contact_email)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.03]"
                >
                  <T k="home.contact.email" />
                </a>
              )}
              {settings.linkedin_url && (
                <a
                  href={settings.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-line bg-background/40 px-6 py-3 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
                >
                  <T k="home.contact.linkedin" />
                </a>
              )}
            </div>
          </div>
        </div>
      </HomeSection>
      </div>
    </>
  );
}
