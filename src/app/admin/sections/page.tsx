import Link from "next/link";
import { getAllSections } from "@/lib/admin-queries";
import { SectionsAdminList } from "@/components/admin/SectionsAdminList";
import { deleteSection, reorderSections } from "./actions";

export default async function AdminSectionsPage() {
  const sections = await getAllSections();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-4xl">Sezioni</h1>
        <Link
          href="/admin/sections/new"
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-[1.03]"
        >
          Nuova sezione
        </Link>
      </div>

      {sections.length === 0 ? (
        <p className="mt-8 text-sm text-muted">
          Nessuna sezione ancora.
        </p>
      ) : (
        <div className="mt-6">
          <p className="mb-3 text-sm text-muted">
            Trascina l&apos;icona ⠿ per riordinare le sezioni.
          </p>
          <SectionsAdminList
            sections={sections}
            onReorder={reorderSections}
            onDelete={deleteSection}
          />
        </div>
      )}
    </div>
  );
}
