import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getBlogPostById, getAllBlogCategories } from "@/lib/admin-queries";
import { getMediaUrl } from "@/lib/supabase/media";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { PhotoUploadForm } from "@/components/admin/PhotoUploadForm";
import { updatePost, uploadPostCover, removePostCover } from "../actions";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const [post, categories] = await Promise.all([
    getBlogPostById(postId),
    getAllBlogCategories(),
  ]);

  if (!post) notFound();

  const boundUpdate = updatePost.bind(null, postId);
  const boundUploadCover = uploadPostCover.bind(null, postId);
  const boundRemoveCover = removePostCover.bind(null, postId);

  return (
    <div>
      <Link
        href="/admin/blog/posts"
        className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        ← Blog
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        {post.title}
      </h1>

      <BlogPostForm
        post={post}
        categories={categories}
        action={boundUpdate}
        submitLabel="Salva articolo"
      />

      <div className="mt-12 border-t border-black/[.08] pt-8 dark:border-white/[.145]">
        <h2 className="text-lg font-semibold tracking-tight">Copertina</h2>
        {post.cover_image_path && (
          <>
            <Image
              src={getMediaUrl(post.cover_image_path)}
              alt="Copertina articolo"
              width={240}
              height={135}
              className="mt-4 rounded-lg object-cover"
            />
            <form action={boundRemoveCover} className="mt-3">
              <button
                type="submit"
                className="rounded border border-red-600/30 px-3 py-1 text-xs text-red-600 dark:text-red-400"
              >
                Rimuovi copertina
              </button>
            </form>
          </>
        )}
        <div className="mt-4">
          <PhotoUploadForm
            action={boundUploadCover}
            submitLabel="Carica copertina"
          />
        </div>
      </div>
    </div>
  );
}
