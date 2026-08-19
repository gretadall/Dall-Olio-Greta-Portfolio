import Link from "next/link";
import { getAllSections } from "@/lib/admin-queries";
import { SectionsAdminList } from "@/components/admin/SectionsAdminList";
import { deleteSection, reorderSections } from "./actions";

export default async function AdminSectionsPage() {
  const sections = await getAllSections();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Sezioni</h1>
        <Link
          href="/admin/sections/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
        >
          Nuova sezione
        </Link>
      </div>

      {sections.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">
          Nessuna sezione ancora.
        </p>
      ) : (
        <div className="mt-6">
          <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
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
