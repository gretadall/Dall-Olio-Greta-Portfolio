import { getSiteSettings, getSectionBySlug, getPublishedEntries } from "@/lib/queries";
import { IntroBlock } from "@/components/home/IntroBlock";
import { SquareGrid } from "@/components/home/SquareGrid";
import { VisionSquare } from "@/components/home/VisionSquare";
import { ValoriSquare } from "@/components/home/ValoriSquare";
import { LinkSquare } from "@/components/home/LinkSquare";
import { Positionable } from "@/components/edit/Positionable";

export default async function Home() {
  const [settings, valoriSection, passioniSection, formazioneSection] = await Promise.all([
    getSiteSettings(),
    getSectionBySlug("valori"),
    getSectionBySlug("passioni"),
    getSectionBySlug("formazione-e-certificati"),
  ]);

  const [valoriEntries, passioniEntries, formazioneEntries] = await Promise.all([
    valoriSection ? getPublishedEntries(valoriSection.id) : Promise.resolve([]),
    passioniSection ? getPublishedEntries(passioniSection.id) : Promise.resolve([]),
    formazioneSection ? getPublishedEntries(formazioneSection.id) : Promise.resolve([]),
  ]);

  const hobbyTeaser =
    passioniSection?.description ||
    passioniEntries[0]?.description ||
    "Le mie passioni, in arrivo.";

  const formazioneTeaser =
    formazioneSection?.description ||
    formazioneEntries[0]?.description ||
    "Il mio percorso formativo, in arrivo.";

  return (
    <div>
      <IntroBlock
        ownerName={settings.owner_name ?? "una persona in continua crescita"}
        tagline={
          settings.tagline ??
          "Questo non è un CV. È un ritratto più completo di chi sono, oltre a competenze ed esperienze: valori, viaggi, attitudini e molto altro."
        }
        heroPhotoPath={settings.hero_photo_path}
        layout={settings.home_layout}
      />
      <SquareGrid>
        <Positionable
          slotKey="square.vision"
          target={{ table: "site_settings" }}
          position={settings.home_layout["square.vision"] ?? null}
          canvasClass="home-canvas"
        >
          <VisionSquare
            text={settings.vision_text}
            icon={settings.vision_icon}
            layout={settings.home_layout}
          />
        </Positionable>
        <Positionable
          slotKey="square.valori"
          target={{ table: "site_settings" }}
          position={settings.home_layout["square.valori"] ?? null}
          canvasClass="home-canvas"
        >
          <ValoriSquare section={valoriSection} entries={valoriEntries} />
        </Positionable>
        <Positionable
          slotKey="square.hobby"
          target={{ table: "site_settings" }}
          position={settings.home_layout["square.hobby"] ?? null}
          canvasClass="home-canvas"
        >
          <LinkSquare
            title="Hobby"
            icon={passioniSection?.icon ?? null}
            teaser={hobbyTeaser}
            href={passioniSection ? `/${passioniSection.slug}` : null}
            sectionId={passioniSection?.id ?? null}
            ctaLabel={passioniSection?.cta_label ?? "Scopri tutto"}
            layout={passioniSection?.home_layout ?? {}}
          />
        </Positionable>
        <Positionable
          slotKey="square.formazione"
          target={{ table: "site_settings" }}
          position={settings.home_layout["square.formazione"] ?? null}
          canvasClass="home-canvas"
        >
          <LinkSquare
            title="Formazione"
            icon={formazioneSection?.icon ?? null}
            teaser={formazioneTeaser}
            href={formazioneSection ? `/${formazioneSection.slug}` : null}
            sectionId={formazioneSection?.id ?? null}
            ctaLabel={formazioneSection?.cta_label ?? "Scopri tutto"}
            layout={formazioneSection?.home_layout ?? {}}
          />
        </Positionable>
      </SquareGrid>
    </div>
  );
}
