import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogCategoryById } from "@/lib/admin-queries";
import { BlogCategoryForm } from "@/components/admin/BlogCategoryForm";
import { updateCategory } from "../actions";

export default async function EditBlogCategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  const category = await getBlogCategoryById(categoryId);

  if (!category) notFound();

  const boundUpdate = updateCategory.bind(null, categoryId);

  return (
    <div>
      <Link
        href="/admin/blog/categories"
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Categorie blog
      </Link>

      <h1 className="mt-4 font-serif text-4xl">
        {category.name}
      </h1>

      <BlogCategoryForm
        category={category}
        action={boundUpdate}
        submitLabel="Salva categoria"
      />
    </div>
  );
}
