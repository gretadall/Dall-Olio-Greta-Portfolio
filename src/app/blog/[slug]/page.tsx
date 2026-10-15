import { notFound } from "next/navigation";
import Image from "next/image";
import { getBlogPostBySlug } from "@/lib/queries";
import { getMediaUrl } from "@/lib/supabase/media";
import { formatItalianDate } from "@/lib/format-date";
import { PageBody, PageHeader } from "@/components/PageHeader";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) notFound();

  const label = [post.blog_categories?.name, post.published_at && formatItalianDate(post.published_at)]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <PageHeader
        back={{ href: "/blog", label: "Blog" }}
        label={label || "Blog"}
        title={post.title}
        intro={post.excerpt}
      />

      <PageBody>
        <article className="max-w-2xl">
          {post.cover_image_path && (
            <Image
              src={getMediaUrl(post.cover_image_path)}
              alt={post.title}
              width={1200}
              height={675}
              sizes="(min-width: 768px) 672px, 100vw"
              className="mb-10 w-full rounded-2xl border border-line object-cover"
            />
          )}
          {post.body && (
            <div
              className="rich-content text-lg leading-relaxed text-muted [&_h2]:text-foreground [&_h3]:text-foreground [&_strong]:text-foreground"
              dangerouslySetInnerHTML={{ __html: post.body }}
            />
          )}
        </article>
      </PageBody>
    </>
  );
}
