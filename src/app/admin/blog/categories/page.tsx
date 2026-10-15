import Link from "next/link";
import { getAllBlogCategories } from "@/lib/admin-queries";
import { BlogCategoriesAdminList } from "@/components/admin/BlogCategoriesAdminList";
import { deleteCategory, reorderCategories } from "./actions";

export default async function AdminBlogCategoriesPage() {
  const categories = await getAllBlogCategories();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-4xl">
          Categorie blog
        </h1>
        <Link
          href="/admin/blog/categories/new"
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-[1.03]"
        >
          Nuova categoria
        </Link>
      </div>

      {categories.length === 0 ? (
        <p className="mt-8 text-sm text-muted">
          Nessuna categoria ancora.
        </p>
      ) : (
        <div className="mt-6">
          <p className="mb-3 text-sm text-muted">
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
