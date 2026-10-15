import { BlogCategoryForm } from "@/components/admin/BlogCategoryForm";
import { createCategory } from "../actions";

export default function NewBlogCategoryPage() {
  return (
    <div>
      <h1 className="font-serif text-4xl">Nuova categoria</h1>
      <BlogCategoryForm action={createCategory} submitLabel="Crea categoria" />
    </div>
  );
}
