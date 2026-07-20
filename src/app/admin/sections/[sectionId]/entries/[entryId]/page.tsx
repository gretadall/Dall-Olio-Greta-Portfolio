import { notFound } from "next/navigation";
import { getSectionById, getEntryById } from "@/lib/admin-queries";
import { EntryForm } from "@/components/admin/EntryForm";
import { updateEntry } from "../actions";

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

  const boundUpdate = updateEntry.bind(null, entryId, sectionId);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        {entry.title} — {section.title}
      </h1>
      <EntryForm entry={entry} action={boundUpdate} submitLabel="Salva contenuto" />
    </div>
  );
}
