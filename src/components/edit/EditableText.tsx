"use client";

import { useRef, useState } from "react";
import { useEditMode } from "./EditModeProvider";
import {
  updateSiteSettingsField,
  updateSectionField,
  updateEntryField,
  updateBrainAreaField,
  updateUiText,
  type SiteSettingsTextField,
  type SiteSettingsColorField,
  type SectionField,
  type EntryField,
  type BrainAreaField,
} from "@/app/edit/actions";

type Target =
  | { table: "site_settings"; field: SiteSettingsTextField | SiteSettingsColorField }
  | { table: "sections"; id: string; field: SectionField }
  | { table: "entries"; id: string; field: EntryField }
  | { table: "brain_areas"; id: string; field: BrainAreaField }
  | { table: "ui_texts"; key: string };

type Tag = "span" | "div" | "p" | "h1" | "h2" | "h3";

export function EditableText({
  value,
  target,
  as = "span",
  className,
  style,
  multiline = false,
  render,
}: {
  value: string;
  target: Target;
  as?: Tag;
  className?: string;
  style?: React.CSSProperties;
  multiline?: boolean;
  /** How to show the value outside edit mode (edit mode always shows it raw). */
  render?: (value: string) => React.ReactNode;
}) {
  const { editMode } = useEditMode();
  const [text, setText] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLElement>(null);

  if (prevValue !== value) {
    setPrevValue(value);
    setText(value);
  }

  const Element = as;

  if (!editMode) {
    if (!value) return null;
    return (
      <Element className={className} style={style}>
        {render ? render(value) : value}
      </Element>
    );
  }

  async function commit() {
    const el = ref.current;
    if (!el) return;
    const next = (el.textContent ?? "").trim();
    if (!next || next === text) {
      el.textContent = text;
      return;
    }
    setSaving(true);
    try {
      if (target.table === "site_settings") {
        await updateSiteSettingsField(target.field, next);
      } else if (target.table === "sections") {
        await updateSectionField(target.id, target.field, next);
      } else if (target.table === "entries") {
        await updateEntryField(target.id, target.field, next);
      } else if (target.table === "ui_texts") {
        await updateUiText(target.key, next);
      } else {
        await updateBrainAreaField(target.id, target.field, next);
      }
      setText(next);
    } catch (err) {
      el.textContent = text;
      window.alert(
        err instanceof Error ? err.message : "Errore durante il salvataggio."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Element
      ref={ref as never}
      className={`${className ?? ""} cursor-text rounded outline-dashed outline-1 outline-transparent transition-opacity hover:outline-primary/50 focus:outline-primary ${saving ? "opacity-50" : ""}`}
      style={style}
      contentEditable
      suppressContentEditableWarning
      // Inside a link or button: edit the text instead of following it.
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onBlur={commit}
      onKeyDown={(e) => {
        if (!multiline && e.key === "Enter") {
          e.preventDefault();
          (e.target as HTMLElement).blur();
        }
      }}
    >
      {text}
    </Element>
  );
}
