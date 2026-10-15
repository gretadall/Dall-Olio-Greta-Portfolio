"use client";

import { createContext, useContext } from "react";
import { EditableText } from "@/components/edit/EditableText";
import { DEFAULT_UI_TEXTS, fillVars, plainText } from "@/lib/ui-texts";

const UiTextsContext = createContext<Record<string, string>>(DEFAULT_UI_TEXTS);

export function UiTextsProvider({
  texts,
  children,
}: {
  texts: Record<string, string>;
  children: React.ReactNode;
}) {
  return <UiTextsContext.Provider value={texts}>{children}</UiTextsContext.Provider>;
}

/** A text as a plain string, for attributes and labels that can't hold markup. */
export function useUiText(key: string, vars?: Record<string, string | number>) {
  const texts = useContext(UiTextsContext);
  return plainText(fillVars(texts[key] ?? key, vars));
}

// "*word*" → pink italic word.
function renderRich(text: string) {
  return text.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith("*") && part.endsWith("*") && part.length > 2 ? (
      <em key={i} className="text-primary">
        {part.slice(1, -1)}
      </em>
    ) : (
      part
    )
  );
}

/**
 * An interface text, editable in place with "✎ Modifica".
 * Usable from server and client components alike.
 */
export function T({
  k,
  vars,
  as,
  className,
}: {
  k: string;
  vars?: Record<string, string | number>;
  as?: "span" | "p" | "h1" | "h2" | "h3" | "div";
  className?: string;
}) {
  const texts = useContext(UiTextsContext);
  return (
    <EditableText
      as={as}
      className={className}
      value={texts[k] ?? k}
      target={{ table: "ui_texts", key: k }}
      render={(value) => renderRich(fillVars(value, vars))}
    />
  );
}
