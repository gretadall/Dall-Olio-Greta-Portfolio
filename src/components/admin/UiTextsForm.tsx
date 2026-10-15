"use client";

import { useState, useTransition } from "react";
import { updateUiText } from "@/app/edit/actions";
import { UI_TEXT_GROUPS } from "@/lib/ui-texts";
import { cardClass, inputClass } from "./ui";

function TextRow({
  textKey,
  label,
  defaultValue,
  initial,
}: {
  textKey: string;
  label: string;
  defaultValue: string;
  initial: string;
}) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const dirty = value !== saved;
  const customised = saved !== defaultValue;

  function save(next: string) {
    setError(null);
    startTransition(async () => {
      try {
        await updateUiText(textKey, next === defaultValue ? "" : next);
        const stored = next.trim() ? next.trim() : defaultValue;
        setValue(stored);
        setSaved(stored);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Errore durante il salvataggio.");
      }
    });
  }

  const long = defaultValue.length > 60;

  return (
    <li className="flex flex-col gap-1.5 py-4">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm">{label}</span>
        {customised && !dirty && <span className="text-xs text-primary">modificato</span>}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        {long ? (
          <textarea
            value={value}
            rows={2}
            onChange={(e) => setValue(e.target.value)}
            className={`${inputClass} flex-1 resize-none`}
          />
        ) : (
          <input value={value} onChange={(e) => setValue(e.target.value)} className={`${inputClass} flex-1`} />
        )}
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!dirty || pending}
            onClick={() => save(value)}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-black disabled:opacity-40"
          >
            {pending ? "…" : "Salva"}
          </button>
          <button
            type="button"
            disabled={(!customised && !dirty) || pending}
            onClick={() => save(defaultValue)}
            title={`Torna a: ${defaultValue}`}
            className="rounded-full border border-line px-4 py-2 text-sm text-muted transition-colors hover:text-foreground disabled:opacity-40"
          >
            Originale
          </button>
        </div>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </li>
  );
}

export function UiTextsForm({ texts }: { texts: Record<string, string> }) {
  return (
    <div className="flex flex-col gap-6">
      {Object.entries(UI_TEXT_GROUPS).map(([id, group]) => (
        <section key={id} className={cardClass}>
          <h2 className="font-serif text-2xl">{group.title}</h2>
          <ul className="mt-2 divide-y divide-line">
            {Object.entries(group.texts).map(([key, { label, value }]) => (
              <TextRow
                key={key}
                textKey={key}
                label={label}
                defaultValue={value}
                initial={texts[key] ?? value}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
