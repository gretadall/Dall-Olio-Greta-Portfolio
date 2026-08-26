import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getBlogPostBySlug } from "@/lib/queries";
import { getMediaUrl } from "@/lib/supabase/media";
import { formatItalianDate } from "@/lib/format-date";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16">
      <Link
        href="/blog"
        className="text-sm text-muted transition-opacity hover:opacity-70"
      >
        ← Blog
      </Link>

      {post.blog_categories && (
        <span
          className="mt-4 inline-block w-fit rounded-full px-3 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: post.blog_categories.color }}
        >
          {post.blog_categories.name}
        </span>
      )}

      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        {post.title}
      </h1>

      {post.published_at && (
        <p className="mt-2 text-sm text-muted">
          {formatItalianDate(post.published_at)}
        </p>
      )}

      {post.cover_image_path && (
        <Image
          src={getMediaUrl(post.cover_image_path)}
          alt={post.title}
          width={800}
          height={450}
          className="mt-6 w-full rounded-lg object-cover"
        />
      )}

      {post.body && (
        <div
          className="rich-content mt-6 text-muted"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />
      )}
    </div>
  );
}
