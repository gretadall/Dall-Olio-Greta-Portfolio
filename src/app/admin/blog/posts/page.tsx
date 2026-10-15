import Link from "next/link";
import { getAllBlogPosts } from "@/lib/admin-queries";
import { BlogPostsAdminList } from "@/components/admin/BlogPostsAdminList";
import { deletePost, reorderPosts } from "./actions";

export default async function AdminBlogPostsPage() {
  const posts = await getAllBlogPosts();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-4xl">Blog</h1>
        <Link
          href="/admin/blog/posts/new"
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-[1.03]"
        >
          Nuovo articolo
        </Link>
      </div>

      <Link
        href="/admin/blog/categories"
        className="mt-2 inline-block text-sm text-muted transition-colors hover:text-foreground"
      >
        Gestisci categorie →
      </Link>

      {posts.length === 0 ? (
        <p className="mt-8 text-sm text-muted">
          Nessun articolo ancora.
        </p>
      ) : (
        <div className="mt-6">
          <p className="mb-3 text-sm text-muted">
            Trascina l&apos;icona ⠿ per riordinare gli articoli.
          </p>
          <BlogPostsAdminList
            posts={posts}
            onReorder={reorderPosts}
            onDelete={deletePost}
          />
        </div>
      )}
    </div>
  );
}
