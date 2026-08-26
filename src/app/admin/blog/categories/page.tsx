import Link from "next/link";
import { getAllBlogCategories } from "@/lib/admin-queries";
import { BlogCategoriesAdminList } from "@/components/admin/BlogCategoriesAdminList";
import { deleteCategory, reorderCategories } from "./actions";

export default async function AdminBlogCategoriesPage() {
  const categories = await getAllBlogCategories();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          Categorie blog
        </h1>
        <Link
          href="/admin/blog/categories/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
        >
          Nuova categoria
        </Link>
      </div>

      {categories.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">
          Nessuna categoria ancora.
        </p>
      ) : (
        <div className="mt-6">
          <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
            Trascina l&apos;icona ⠿ per riordinare le categorie.
          </p>
          <BlogCategoriesAdminList
            categories={categories}
            onReorder={reorderCategories}
            onDelete={deleteCategory}
          />
        </div>
      )}
    </div>
  );
}
