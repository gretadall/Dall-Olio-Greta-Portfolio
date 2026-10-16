"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { updateHomePicks } from "@/app/admin/home/actions";
import { cardClass, primaryButtonClass } from "./ui";

export type PickOption = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
};

const smallButton =
  "flex h-8 w-8 items-center justify-center rounded-full border border-line text-sm transition-colors hover:border-primary hover:text-primary disabled:opacity-30";

export function HomePicker({
  kind,
  title,
  description,
  options,
  initial,
  ordered = true,
}: {
  kind: string;
  title: string;
  description: string;
  options: PickOption[];
  initial: string[];
  /** Whether the chosen order matters (the timeline is always by date). */
  ordered?: boolean;
}) {
  const known = new Set(options.map((o) => o.id));
  const [picked, setPicked] = useState(() => initial.filter((id) => known.has(id)));
  const [saved, setSaved] = useState(picked);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const byId = new Map(options.map((o) => [o.id, o]));
  const dirty = picked.join() !== saved.join();
  const available = options.filter((o) => !picked.includes(o.id));

  function move(index: number, delta: number) {
    setPicked((list) => {
      const next = [...list];
      const [item] = next.splice(index, 1);
      next.splice(index + delta, 0, item);
      return next;
    });
  }

  function save(ids: string[]) {
    setMessage(null);
    startTransition(async () => {
      try {
        await updateHomePicks(kind, ids);
        setPicked(ids);
        setSaved(ids);
        setMessage("Salvato.");
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Errore durante il salvataggio.");
      }
    });
  }

  const thumb = (option: PickOption) =>
    option.imageUrl ? (
      <Image
        src={option.imageUrl}
        alt=""
        width={56}
        height={56}
        className="h-14 w-14 shrink-0 rounded-lg border border-line object-cover"
      />
    ) : null;

  return (
    <section className={cardClass}>
      <h2 className="font-serif text-2xl">{title}</h2>
      <p className="mt-1 text-sm text-muted">{description}</p>

      <h3 className="mt-6 text-sm font-medium">
        In evidenza {picked.length > 0 ? `(${picked.length})` : ""}
      </h3>
      {picked.length === 0 ? (
        <p className="mt-2 rounded-xl border border-dashed border-line px-4 py-3 text-sm text-muted">
          Nessuna scelta: il sito li sceglie in automatico. Aggiungine qui sotto.
        </p>
      ) : (
        <ol className="mt-2 flex flex-col gap-2">
          {picked.map((id, i) => {
            const option = byId.get(id);
            if (!option) return null;
            return (
              <li key={id} className="flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/5 p-2 pr-3">
                {ordered && <span className="w-6 text-center font-serif text-primary italic">{i + 1}</span>}
                {thumb(option)}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm">{option.title}</span>
                  {option.subtitle && <span className="block truncate text-xs text-muted">{option.subtitle}</span>}
                </span>
                {ordered && (
                  <>
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className={smallButton} title="Su">
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === picked.length - 1}
                      className={smallButton}
                      title="Giù"
                    >
                      ↓
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setPicked((list) => list.filter((x) => x !== id))}
                  className={smallButton}
                  title="Togli"
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ol>
      )}

      {available.length > 0 && (
        <>
          <h3 className="mt-6 text-sm font-medium">Da aggiungere</h3>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {available.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  onClick={() => setPicked((list) => [...list, option.id])}
                  className="flex w-full items-center gap-3 rounded-xl border border-line p-2 pr-3 text-left transition-colors hover:border-primary"
                >
                  {thumb(option)}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{option.title}</span>
                    {option.subtitle && <span className="block truncate text-xs text-muted">{option.subtitle}</span>}
                  </span>
                  <span aria-hidden className="text-primary">+</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" disabled={!dirty || pending} onClick={() => save(picked)} className={primaryButtonClass}>
          {pending ? "Salvataggio…" : "Salva"}
        </button>
        {saved.length > 0 && (
          <button
            type="button"
            disabled={pending}
            onClick={() => save([])}
            className="rounded-full border border-line px-5 py-2.5 text-sm text-muted transition-colors hover:text-foreground"
          >
            Torna alla scelta automatica
          </button>
        )}
        {message && <span className="text-sm text-muted">{message}</span>}
      </div>
    </section>
  );
}
