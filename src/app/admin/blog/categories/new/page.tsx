import { BlogCategoryForm } from "@/components/admin/BlogCategoryForm";
import { createCategory } from "../actions";

export default function NewBlogCategoryPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Nuova categoria</h1>
      <BlogCategoryForm action={createCategory} submitLabel="Crea categoria" />
    </div>
  );
}
