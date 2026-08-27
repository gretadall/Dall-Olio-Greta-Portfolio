import { Positionable } from "@/components/edit/Positionable";
import { EditableText } from "@/components/edit/EditableText";
import { CARD_CLASS } from "./LinkSquare";
import type { HomeLayout } from "@/lib/supabase/types";

export function VisionSquare({
  text,
  icon,
  layout,
}: {
  text: string | null;
  icon: string | null;
  layout: HomeLayout;
}) {
  return (
    <div className={CARD_CLASS}>
      <Positionable
        slotKey="vision.heading"
        target={{ table: "site_settings" }}
        position={layout["vision.heading"] ?? null}
      >
        <div className="flex flex-col gap-3">
          <EditableText
            as="span"
            className="text-3xl leading-none"
            value={icon ?? "🔭"}
            target={{ table: "site_settings", field: "vision_icon" }}
          />
          <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
            Vision
          </h2>
        </div>
      </Positionable>
      <Positionable
        slotKey="vision.body"
        target={{ table: "site_settings" }}
        position={layout["vision.body"] ?? null}
        className="mt-3"
      >
        <div
          className="rich-content text-sm text-muted [&_a]:text-primary"
          dangerouslySetInnerHTML={{
            __html: text || "<p>Contenuto in arrivo.</p>",
          }}
        />
      </Positionable>
    </div>
  );
}
