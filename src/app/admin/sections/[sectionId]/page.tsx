import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getSectionById, getAllEntries } from "@/lib/admin-queries";
import { getMediaUrl } from "@/lib/supabase/media";
import { SectionForm } from "@/components/admin/SectionForm";
import { PhotoUploadForm } from "@/components/admin/PhotoUploadForm";
import {
  updateSection,
  uploadSectionBackground,
  removeSectionBackground,
} from "../actions";
import { deleteEntry, moveEntry } from "./entries/actions";

export default async function EditSectionPage({
  params,
}: {
  params: Promise<{ sectionId: string }>;
}) {
  const { sectionId } = await params;
  const section = await getSectionById(sectionId);

  if (!section) notFound();

  const entries = await getAllEntries(sectionId);
  const boundUpdate = updateSection.bind(null, sectionId);
  const boundUploadBackground = uploadSectionBackground.bind(null, sectionId);
  const boundRemoveBackground = removeSectionBackground.bind(null, sectionId);

  return (
    <div>
      <Link
        href="/admin/sections"
        className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        ← Sezioni
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        {section.title}
      </h1>

      <SectionForm
        section={section}
        action={boundUpdate}
        submitLabel="Salva sezione"
      />

      <div className="mt-12 border-t border-black/[.08] pt-8 dark:border-white/[.145]">
        <h2 className="text-lg font-semibold tracking-tight">
          Sfondo sezione
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Un&apos;immagine di sfondo per questa sezione e i suoi contenuti, al
          posto dello sfondo generale del sito.
        </p>
        {section.background_image_path && (
          <>
            <Image
              src={getMediaUrl(section.background_image_path)}
              alt="Sfondo sezione"
              width={240}
              height={135}
              className="mt-4 rounded-lg object-cover"
            />
            <form action={boundRemoveBackground} className="mt-3">
              <button
                type="submit"
                className="rounded border border-red-600/30 px-3 py-1 text-xs text-red-600 dark:text-red-400"
              >
                Rimuovi sfondo
              </button>
            </form>
          </>
        )}
        <div className="mt-4">
          <PhotoUploadForm
            action={boundUploadBackground}
            submitLabel="Carica sfondo"
          />
        </div>
      </div>

      <div className="mt-12 border-t border-black/[.08] pt-8 dark:border-white/[.145]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Contenuti</h2>
          <Link
            href={`/admin/sections/${sectionId}/entries/new`}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
          >
            Nuovo contenuto
          </Link>
        </div>

        {entries.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
            Nessun contenuto ancora in questa sezione.
          </p>
        ) : (
          <ul className="mt-6 flex flex-col gap-3">
            {entries.map((entry, index) => (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-black/[.08] p-4 dark:border-white/[.145]"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{entry.title}</span>
                    {!entry.is_published && (
                      <span className="rounded bg-yellow-500/15 px-2 py-0.5 text-xs text-yellow-700 dark:text-yellow-400">
                        Bozza
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    /{section.slug}/{entry.slug}
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <form action={moveEntry.bind(null, entry.id, sectionId, "up")}>
                    <button
                      type="submit"
                      disabled={index === 0}
                      className="rounded border border-black/[.12] px-2 py-1 text-xs disabled:opacity-30 dark:border-white/[.16]"
                    >
                      ↑
                    </button>
                  </form>
                  <form action={moveEntry.bind(null, entry.id, sectionId, "down")}>
                    <button
                      type="submit"
                      disabled={index === entries.length - 1}
                      className="rounded border border-black/[.12] px-2 py-1 text-xs disabled:opacity-30 dark:border-white/[.16]"
                    >
                      ↓
                    </button>
                  </form>
                  <Link
                    href={`/admin/sections/${sectionId}/entries/${entry.id}`}
                    className="rounded border border-black/[.12] px-3 py-1 text-xs dark:border-white/[.16]"
                  >
                    Modifica
                  </Link>
                  <form action={deleteEntry.bind(null, entry.id, sectionId)}>
                    <button
                      type="submit"
                      className="rounded border border-red-600/30 px-3 py-1 text-xs text-red-600 dark:text-red-400"
                    >
                      Elimina
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
