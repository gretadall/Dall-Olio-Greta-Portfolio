import Link from "next/link";
import type { Database } from "@/lib/supabase/types";
import { formatItalianDate } from "@/lib/format-date";

type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"] & {
  blog_categories: { name: string; slug: string; color: string } | null;
};

export function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col gap-2 border-b border-black/[.08] py-6 dark:border-white/[.145]"
    >
      {post.blog_categories && (
        <span
          className="w-fit rounded-full px-3 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: post.blog_categories.color }}
        >
          {post.blog_categories.name}
        </span>
      )}
      <h2 className="text-xl font-semibold tracking-tight transition-opacity group-hover:opacity-70">
        {post.title}
      </h2>
      {post.excerpt && (
        <p className="line-clamp-3 text-sm text-muted">{post.excerpt}</p>
      )}
      <div className="mt-1 flex items-center justify-between gap-4">
        {post.published_at && (
          <span className="text-xs text-muted">
            {formatItalianDate(post.published_at)}
          </span>
        )}
        <span className="text-sm font-medium text-primary">→</span>
      </div>
    </Link>
  );
}
