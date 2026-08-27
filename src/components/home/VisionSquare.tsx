import { Positionable } from "@/components/edit/Positionable";
import { EditableText } from "@/components/edit/EditableText";
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
    <div className="square-canvas relative rounded-xl border border-black/[.08] p-6 dark:border-white/[.145]">
      <Positionable
        slotKey="vision.heading"
        target={{ table: "site_settings" }}
        position={layout["vision.heading"] ?? null}
      >
        <div className="flex items-center gap-2">
          <EditableText
            as="span"
            className="text-2xl leading-none"
            value={icon ?? "🔭"}
            target={{ table: "site_settings", field: "vision_icon" }}
          />
          <h2 className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">
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
          className="rich-content text-sm text-muted"
          dangerouslySetInnerHTML={{
            __html: text || "<p>Contenuto in arrivo.</p>",
          }}
        />
      </Positionable>
    </div>
  );
}
