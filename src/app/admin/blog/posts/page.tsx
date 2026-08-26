import Link from "next/link";
import { getAllBlogPosts } from "@/lib/admin-queries";
import { BlogPostsAdminList } from "@/components/admin/BlogPostsAdminList";
import { deletePost, reorderPosts } from "./actions";

export default async function AdminBlogPostsPage() {
  const posts = await getAllBlogPosts();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Blog</h1>
        <Link
          href="/admin/blog/posts/new"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
        >
          Nuovo articolo
        </Link>
      </div>

      <Link
        href="/admin/blog/categories"
        className="mt-2 inline-block text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        Gestisci categorie →
      </Link>

      {posts.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">
          Nessun articolo ancora.
        </p>
      ) : (
        <div className="mt-6">
          <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
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
