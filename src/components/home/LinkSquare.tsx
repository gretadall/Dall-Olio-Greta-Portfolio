import Link from "next/link";
import { Positionable } from "@/components/edit/Positionable";
import { EditableText } from "@/components/edit/EditableText";
import type { HomeLayout } from "@/lib/supabase/types";

export const CARD_CLASS =
  "square-canvas relative rounded-2xl bg-zinc-950 p-6 ring-1 ring-white/10 transition-colors hover:ring-white/20";

export function LinkSquare({
  title,
  icon,
  teaser,
  href,
  sectionId,
  ctaLabel,
  layout,
}: {
  title: string;
  icon: string | null;
  teaser: string;
  href: string | null;
  sectionId: string | null;
  ctaLabel: string;
  layout: HomeLayout;
}) {
  const titleEl = (
    <div className="flex flex-col gap-3">
      {sectionId ? (
        <EditableText
          as="span"
          className="text-3xl leading-none"
          value={icon ?? ""}
          target={{ table: "sections", id: sectionId, field: "icon" }}
        />
      ) : (
        icon && <span className="text-3xl leading-none">{icon}</span>
      )}
      <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">
        {title}
      </h2>
    </div>
  );
  const teaserEl = (
    <>
      <p className="text-sm text-zinc-400">{teaser}</p>
      {href && (
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
          {sectionId ? (
            <EditableText
              as="span"
              value={ctaLabel}
              target={{ table: "sections", id: sectionId, field: "cta_label" }}
            />
          ) : (
            ctaLabel
          )}
          {" →"}
        </span>
      )}
    </>
  );

  const content = sectionId ? (
    <>
      <Positionable
        slotKey="title"
        target={{ table: "sections", id: sectionId }}
        position={layout.title ?? null}
      >
        {titleEl}
      </Positionable>
      <Positionable
        slotKey="teaser"
        target={{ table: "sections", id: sectionId }}
        position={layout.teaser ?? null}
        className="mt-3"
      >
        {teaserEl}
      </Positionable>
    </>
  ) : (
    <>
      {titleEl}
      <div className="mt-3">{teaserEl}</div>
    </>
  );

  if (!href) {
    return <div className={CARD_CLASS}>{content}</div>;
  }

  return (
    <Link href={href} className={`group ${CARD_CLASS}`}>
      {content}
    </Link>
  );
}
