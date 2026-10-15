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
      <h1 className="font-serif text-4xl">
        {entry.title} — {section.title}
      </h1>
      <EntryForm entry={entry} action={boundUpdate} submitLabel="Salva contenuto" />

      <div className="mt-8 rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-serif text-2xl">Foto e file</h2>

        {media.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {media.map((photo) => (
              <div key={photo.id} className="flex flex-col gap-2">
                {isPdfPath(photo.storage_path) ? (
                  <a
                    href={getMediaUrl(photo.storage_path)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-line bg-surface text-xs text-muted"
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
                    className="w-full rounded-full border border-red-500/40 px-2 py-1 text-xs text-red-400"
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

      <div className="mt-8 rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-serif text-2xl">Connessioni</h2>
        <p className="mt-1 text-sm text-muted">
          Mostra come questo contenuto ha contribuito a formare altri tratti o
          esperienze.
        </p>

        {connections.length > 0 && (
          <ul className="mt-4 flex flex-col gap-2">
            {connections.map((connection) => (
              <li
                key={connection.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface px-4 py-2"
              >
                <span className="text-sm">
                  {connection.bidirectional ? "↔" : "→"}{" "}
                  {connection.label &&
                    `${connection.label} ${connection.bidirectional ? "↔" : "→"} `}
                  <strong>{connection.to_entry?.title}</strong>
                  {connection.to_entry?.sections?.title && (
                    <span className="text-muted">
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
                    className="rounded-full border border-red-500/40 px-3 py-1 text-xs text-red-400 transition-colors hover:bg-red-500/10"
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
