import {
  getChiSonoSections,
  getPublishedEntries,
  getPublishedTravelPins,
  getLatestBlogPosts,
} from "@/lib/queries";
import { HomeSectionsEditable } from "@/components/home/HomeSectionsEditable";
import { BlogTeaserSection } from "@/components/home/BlogTeaserSection";
import { SectionDotNav } from "@/components/home/SectionDotNav";
import { buildGlobePins } from "@/lib/travel-pins";

export default async function ChiSonoPage() {
  const sections = await getChiSonoSections();
  const hasTravel = sections.some((s) => s.slug === "viaggi");

  const [entriesBySection, travelPinsRaw, latestPosts] = await Promise.all([
    Promise.all(sections.map((s) => getPublishedEntries(s.id))),
    hasTravel ? getPublishedTravelPins() : Promise.resolve([]),
    getLatestBlogPosts(3),
  ]);

  const travelPins = buildGlobePins(travelPinsRaw);

  return (
    <div>
      <div className="mx-auto w-full max-w-4xl px-6 pt-16">
        <h1 className="text-3xl font-semibold tracking-tight">Chi sono</h1>
      </div>

      {sections.length === 0 ? (
        <p className="mx-auto max-w-4xl px-6 py-12 text-sm text-muted">
          Nessuna sezione pubblicata ancora.
        </p>
      ) : (
        <HomeSectionsEditable
          sections={sections}
          entriesBySection={entriesBySection}
          travelPins={travelPins}
        />
      )}

      <BlogTeaserSection posts={latestPosts} />

      <SectionDotNav
        sections={[
          ...sections.map((s) => ({ slug: s.slug, title: s.title })),
          { slug: "blog", title: "Blog" },
        ]}
      />
    </div>
  );
}
