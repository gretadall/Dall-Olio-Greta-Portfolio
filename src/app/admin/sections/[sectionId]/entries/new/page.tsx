import { notFound } from "next/navigation";
import { getSectionById } from "@/lib/admin-queries";
import { EntryForm } from "@/components/admin/EntryForm";
import { createEntry } from "../actions";

export default async function NewEntryPage({
  params,
}: {
  params: Promise<{ sectionId: string }>;
}) {
  const { sectionId } = await params;
  const section = await getSectionById(sectionId);

  if (!section) notFound();

  const boundCreate = createEntry.bind(null, sectionId);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Nuovo contenuto — {section.title}
      </h1>
      <EntryForm action={boundCreate} submitLabel="Crea contenuto" />
    </div>
  );
}
