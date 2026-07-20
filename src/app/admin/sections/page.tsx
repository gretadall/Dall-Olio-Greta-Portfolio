import Link from "next/link";
import { getAllSections } from "@/lib/admin-queries";
import { deleteSection, moveSection } from "./actions";

export default async function AdminSectionsPage() {
  const sections = await getAllSections();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Sezioni</h1>
        <Link
          href="/admin/sections/new"
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Nuova sezione
        </Link>
      </div>

      {sections.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">
          Nessuna sezione ancora.
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {sections.map((section, index) => (
            <li
              key={section.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-black/[.08] p-4 dark:border-white/[.145]"
            >
              <div className="flex min-w-0 items-center gap-3">
                {section.icon && <span className="text-lg">{section.icon}</span>}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{section.title}</span>
                    {!section.is_published && (
                      <span className="rounded bg-yellow-500/15 px-2 py-0.5 text-xs text-yellow-700 dark:text-yellow-400">
                        Bozza
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    /{section.slug}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <form action={moveSection.bind(null, section.id, "up")}>
                  <button
                    type="submit"
                    disabled={index === 0}
                    className="rounded border border-black/[.12] px-2 py-1 text-xs disabled:opacity-30 dark:border-white/[.16]"
                  >
                    ↑
                  </button>
                </form>
                <form action={moveSection.bind(null, section.id, "down")}>
                  <button
                    type="submit"
                    disabled={index === sections.length - 1}
                    className="rounded border border-black/[.12] px-2 py-1 text-xs disabled:opacity-30 dark:border-white/[.16]"
                  >
                    ↓
                  </button>
                </form>
                <Link
                  href={`/admin/sections/${section.id}`}
                  className="rounded border border-black/[.12] px-3 py-1 text-xs dark:border-white/[.16]"
                >
                  Modifica
                </Link>
                <form action={deleteSection.bind(null, section.id)}>
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
  );
}
