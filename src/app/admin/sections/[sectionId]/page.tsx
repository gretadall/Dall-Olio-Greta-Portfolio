import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getSectionById, getAllEntries } from "@/lib/admin-queries";
import { getMediaUrl } from "@/lib/supabase/media";
import { SectionForm } from "@/components/admin/SectionForm";
import { PhotoUploadForm } from "@/components/admin/PhotoUploadForm";
import { EntriesAdminList } from "@/components/admin/EntriesAdminList";
import { cardClass, primaryButtonClass } from "@/components/admin/ui";
import { updateSection, uploadSectionBackground, removeSectionBackground } from "../actions";
import { deleteEntry, reorderEntries } from "./entries/actions";

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
  // The column is still called "background" in the database; on the site it
  // is the section's cover photo.
  const boundUploadCover = uploadSectionBackground.bind(null, sectionId);
  const boundRemoveCover = removeSectionBackground.bind(null, sectionId);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/admin/sections" className="text-sm text-muted transition-colors hover:text-foreground">
          ← Sezioni
        </Link>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-serif text-4xl">
            {section.icon && <span className="mr-3 not-italic">{section.icon}</span>}
            {section.title}
          </h1>
          <Link
            href={`/${section.slug}`}
            target="_blank"
            className="rounded-full border border-line px-4 py-2 text-sm transition-colors hover:border-primary hover:text-primary"
          >
            Vedi sul sito ↗
          </Link>
        </div>
      </div>

      <section className={cardClass}>
        <h2 className="mb-5 font-serif text-2xl">Dettagli</h2>
        <SectionForm section={section} action={boundUpdate} submitLabel="Salva sezione" />
      </section>

      <section className={cardClass}>
        <h2 className="font-serif text-2xl">Foto di copertina</h2>
        <p className="mt-1 text-sm text-muted">
          Appare in cima alla pagina della sezione e sulla sua card in &quot;Chi sono&quot; e in
          home.
        </p>
        <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end">
          {section.background_image_path && (
            <div className="flex flex-col gap-3">
              <Image
                src={getMediaUrl(section.background_image_path)}
                alt="Foto di copertina"
                width={320}
                height={200}
                className="aspect-[16/10] w-56 rounded-2xl border border-line object-cover"
              />
              <form action={boundRemoveCover}>
                <button
                  type="submit"
                  className="rounded-full border border-red-500/40 px-3 py-1 text-xs text-red-400 transition-colors hover:bg-red-500/10"
                >
                  Rimuovi foto
                </button>
              </form>
            </div>
          )}
          <PhotoUploadForm
            action={boundUploadCover}
            submitLabel={section.background_image_path ? "Sostituisci foto" : "Carica foto"}
          />
        </div>
      </section>

      <section className={cardClass}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-serif text-2xl">Contenuti</h2>
          <Link href={`/admin/sections/${sectionId}/entries/new`} className={primaryButtonClass}>
            + Nuovo contenuto
          </Link>
        </div>

        {entries.length === 0 ? (
          <p className="mt-6 text-sm text-muted">Nessun contenuto ancora in questa sezione.</p>
        ) : (
          <div className="mt-6">
            <p className="mb-3 text-sm text-muted">Trascina l&apos;icona ⠿ per riordinare i contenuti.</p>
            <EntriesAdminList
              entries={entries}
              sectionId={sectionId}
              sectionSlug={section.slug}
              onReorder={reorderEntries.bind(null, sectionId)}
              onDelete={deleteEntry.bind(null, sectionId)}
            />
          </div>
        )}
      </section>
    </div>
  );
}
