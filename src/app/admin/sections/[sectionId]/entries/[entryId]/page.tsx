import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getSectionById,
  getEntryById,
  getAllEntriesFlat,
  getEntryOutgoingConnections,
} from "@/lib/admin-queries";
import { getEntryMedia } from "@/lib/queries";
import { getMediaUrl, isPdfPath } from "@/lib/supabase/media";
import { EntryForm } from "@/components/admin/EntryForm";
import { ConnectionForm } from "@/components/admin/ConnectionForm";
import { PhotoUploadForm } from "@/components/admin/PhotoUploadForm";
import { updateEntry } from "../actions";
import { createConnection, deleteConnection } from "./connections/actions";
import { uploadEntryMedia, deleteEntryMedia } from "./media/actions";

export default async function EditEntryPage({
  params,
}: {
  params: Promise<{ sectionId: string; entryId: string }>;
}) {
  const { sectionId, entryId } = await params;
  const [section, entry] = await Promise.all([
    getSectionById(sectionId),
    getEntryById(entryId),
  ]);

  if (!section || !entry || entry.section_id !== sectionId) notFound();

  const [allEntries, connections, media] = await Promise.all([
    getAllEntriesFlat(),
    getEntryOutgoingConnections(entryId),
    getEntryMedia(entryId),
  ]);

  const boundUpdate = updateEntry.bind(null, entryId, sectionId);
  const boundCreateConnection = createConnection.bind(
    null,
    entryId,
    sectionId,
    entryId
  );
  const boundUploadMedia = uploadEntryMedia.bind(null, entryId, sectionId);

  const entryOptions = allEntries
    .filter((e) => e.id !== entryId)
    .map((e) => ({
      id: e.id,
      title: e.title,
      sectionTitle: e.sections?.title ?? "",
    }));

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        {entry.title} — {section.title}
      </h1>
      <EntryForm entry={entry} action={boundUpdate} submitLabel="Salva contenuto" />

      <div className="mt-12 border-t border-black/[.08] pt-8 dark:border-white/[.145]">
        <h2 className="text-lg font-semibold tracking-tight">Foto e file</h2>

        {media.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {media.map((photo) => (
              <div key={photo.id} className="flex flex-col gap-2">
                {isPdfPath(photo.storage_path) ? (
                  <a
                    href={getMediaUrl(photo.storage_path)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-black/[.12] bg-zinc-50 text-xs text-zinc-600 dark:border-white/[.16] dark:bg-zinc-900 dark:text-zinc-300"
                  >
                    <span className="text-2xl">📄</span>
                    PDF
                  </a>
                ) : (
                  <Image
                    src={getMediaUrl(photo.storage_path)}
                    alt={photo.alt_text ?? ""}
                    width={150}
                    height={150}
                    className="aspect-square rounded-lg object-cover"
                  />
                )}
                <form
                  action={deleteEntryMedia.bind(
                    null,
                    photo.id,
                    photo.storage_path,
                    sectionId,
                    entryId
                  )}
                >
                  <button
                    type="submit"
                    className="w-full rounded border border-red-600/30 px-2 py-1 text-xs text-red-600 dark:text-red-400"
                  >
                    Elimina
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4">
          <PhotoUploadForm
            action={boundUploadMedia}
            submitLabel="Carica foto o PDF"
            accept="image/*,application/pdf"
          />
        </div>
      </div>

      <div className="mt-12 border-t border-black/[.08] pt-8 dark:border-white/[.145]">
        <h2 className="text-lg font-semibold tracking-tight">Connessioni</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Mostra come questo contenuto ha contribuito a formare altri tratti o
          esperienze.
        </p>

        {connections.length > 0 && (
          <ul className="mt-4 flex flex-col gap-2">
            {connections.map((connection) => (
              <li
                key={connection.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-black/[.08] px-4 py-2 dark:border-white/[.145]"
              >
                <span className="text-sm">
                  → {connection.label} →{" "}
                  <strong>{connection.to_entry?.title}</strong>
                  {connection.to_entry?.sections?.title && (
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {" "}
                      ({connection.to_entry.sections.title})
                    </span>
                  )}
                </span>
                <form
                  action={deleteConnection.bind(
                    null,
                    connection.id,
                    sectionId,
                    entryId
                  )}
                >
                  <button
                    type="submit"
                    className="rounded border border-red-600/30 px-3 py-1 text-xs text-red-600 dark:text-red-400"
                  >
                    Elimina
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <ConnectionForm entries={entryOptions} action={boundCreateConnection} />
      </div>
    </div>
  );
}
