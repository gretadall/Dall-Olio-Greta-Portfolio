import { getSiteSettings, getSectionBySlug, getPublishedEntries } from "@/lib/queries";
import { IntroBlock } from "@/components/home/IntroBlock";
import { SquareGrid } from "@/components/home/SquareGrid";
import { VisionSquare } from "@/components/home/VisionSquare";
import { ExpandableSquare } from "@/components/home/ExpandableSquare";
import { LinkSquare } from "@/components/home/LinkSquare";

export default async function Home() {
  const [settings, passioniSection] = await Promise.all([
    getSiteSettings(),
    getSectionBySlug("passioni"),
  ]);

  const passioniEntries = passioniSection
    ? await getPublishedEntries(passioniSection.id)
    : [];

  const hobbyTeaser =
    passioniSection?.description ||
    passioniEntries[0]?.description ||
    "Le mie passioni, in arrivo.";

  return (
    <div>
      <IntroBlock
        ownerName={settings.owner_name ?? "una persona in continua crescita"}
        tagline={
          settings.tagline ??
          "Questo non è un CV. È un ritratto più completo di chi sono, oltre a competenze ed esperienze: valori, viaggi, attitudini e molto altro."
        }
        heroPhotoPath={settings.hero_photo_path}
      />
      <SquareGrid>
        <VisionSquare text={settings.vision_text} />
        <ExpandableSquare
          title="Valori"
          intro={settings.valori_intro}
          body={settings.valori_body}
        />
        <LinkSquare
          title="Hobby"
          teaser={hobbyTeaser}
          href={passioniSection ? `/${passioniSection.slug}` : null}
        />
        <ExpandableSquare
          title="Formazione"
          intro={settings.formazione_intro}
          body={settings.formazione_body}
        />
      </SquareGrid>
    </div>
  );
}
