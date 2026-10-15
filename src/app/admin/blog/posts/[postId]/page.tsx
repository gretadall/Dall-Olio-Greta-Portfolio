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
        className="text-sm text-muted transition-colors hover:text-foreground"
      >
        ← Blog
      </Link>

      <h1 className="mt-4 font-serif text-4xl">
        {post.title}
      </h1>

      <BlogPostForm
        post={post}
        categories={categories}
        action={boundUpdate}
        submitLabel="Salva articolo"
      />

      <div className="mt-8 rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-serif text-2xl">Copertina</h2>
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
                className="rounded-full border border-red-500/40 px-3 py-1 text-xs text-red-400 transition-colors hover:bg-red-500/10"
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
