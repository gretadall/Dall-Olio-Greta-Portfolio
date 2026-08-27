import Link from "next/link";
import { Positionable } from "@/components/edit/Positionable";
import { EditableText } from "@/components/edit/EditableText";
import type { HomeLayout } from "@/lib/supabase/types";

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
    <div className="flex flex-col gap-2">
      {sectionId ? (
        <EditableText
          as="span"
          className="text-2xl leading-none"
          value={icon ?? ""}
          target={{ table: "sections", id: sectionId, field: "icon" }}
        />
      ) : (
        icon && <span className="text-2xl leading-none">{icon}</span>
      )}
      <h2 className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">
        {title}
      </h2>
    </div>
  );
  const teaserEl = (
    <>
      <p className="text-sm text-muted">{teaser}</p>
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
    return (
      <div className="square-canvas relative rounded-xl border border-black/[.08] p-6 dark:border-white/[.145]">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="square-canvas group relative rounded-xl border border-black/[.08] p-6 transition-colors hover:border-black/[.16] dark:border-white/[.145] dark:hover:border-white/[.3]"
    >
      {content}
    </Link>
  );
}
