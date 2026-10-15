import { getAllBlogCategories } from "@/lib/admin-queries";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { createPost } from "../actions";

export default async function NewBlogPostPage() {
  const categories = await getAllBlogCategories();

  return (
    <div>
      <h1 className="font-serif text-4xl">Nuovo articolo</h1>
      <BlogPostForm
        categories={categories}
        action={createPost}
        submitLabel="Crea articolo"
      />
    </div>
  );
}
