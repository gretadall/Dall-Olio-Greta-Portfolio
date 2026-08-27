"use client";

import { useState } from "react";
import type { Database } from "@/lib/supabase/types";
import type { GlobePin } from "@/components/TravelGlobe";
import { SectionBlock } from "./SectionBlock";
import { DeleteButton } from "@/components/edit/DeleteButton";
import { MoveButtons } from "@/components/edit/MoveButtons";
import { deleteSection, reorderSections } from "@/app/admin/sections/actions";

type Section = Database["public"]["Tables"]["sections"]["Row"];
type Entry = Database["public"]["Tables"]["entries"]["Row"];

export function HomeSectionsEditable({
  sections,
  entriesBySection,
  travelPins,
}: {
  sections: Section[];
  entriesBySection: Entry[][];
  travelPins: GlobePin[];
}) {
  const [order, setOrder] = useState(sections);

  const idsKey = sections.map((s) => s.id).join(",");
  const [prevIdsKey, setPrevIdsKey] = useState(idsKey);
  if (prevIdsKey !== idsKey) {
    setPrevIdsKey(idsKey);
    setOrder(sections);
  }

  const entriesById = new Map(
    sections.map((section, index) => [section.id, entriesBySection[index]])
  );

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
    reorderSections(next.map((s) => s.id));
  }

  return (
    <>
      {order.map((section, index) => (
        <div key={section.id} className="relative">
          <MoveButtons
            onUp={() => move(index, -1)}
            onDown={() => move(index, 1)}
            disabledUp={index === 0}
            disabledDown={index === order.length - 1}
          />
          <DeleteButton
            label={section.title}
            action={deleteSection.bind(null, section.id)}
          />
          <SectionBlock
            section={section}
            entries={entriesById.get(section.id) ?? []}
            travelPins={section.slug === "viaggi" ? travelPins : undefined}
          />
        </div>
      ))}
    </>
  );
}
