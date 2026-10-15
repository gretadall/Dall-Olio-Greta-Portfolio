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
      <h1 className="font-serif text-4xl">
        Nuovo contenuto — {section.title}
      </h1>
      <EntryForm action={boundCreate} submitLabel="Crea contenuto" />
    </div>
  );
}
