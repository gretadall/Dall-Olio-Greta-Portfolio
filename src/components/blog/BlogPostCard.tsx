import Link from "next/link";
import type { Database } from "@/lib/supabase/types";
import { formatItalianDate } from "@/lib/format-date";

type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"] & {
  blog_categories: { name: string; slug: string; color: string } | null;
};

export function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group grid gap-2 py-7 sm:grid-cols-[12rem_1fr_auto] sm:gap-8">
      <span className="font-medium tabular-nums text-xs text-muted">
        {post.published_at ? formatItalianDate(post.published_at) : ""}
        {post.blog_categories && (
          <span className="mt-1 block text-primary">{post.blog_categories.name}</span>
        )}
      </span>
      <span>
        <span className="block font-serif text-2xl transition-colors group-hover:text-primary">
          {post.title}
        </span>
        {post.excerpt && (
          <span className="mt-2 line-clamp-2 block text-sm leading-relaxed text-muted">
            {post.excerpt}
          </span>
        )}
      </span>
      <span aria-hidden className="hidden text-muted transition-colors group-hover:text-primary sm:block">
        ↗
      </span>
    </Link>
  );
}
