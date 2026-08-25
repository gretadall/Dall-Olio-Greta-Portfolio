import Link from "next/link";
import type { Database } from "@/lib/supabase/types";
import { formatItalianDate } from "@/lib/format-date";
import { Reveal } from "./Reveal";

type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"] & {
  blog_categories: { name: string; slug: string; color: string } | null;
};

export function BlogTeaserSection({ posts }: { posts: BlogPost[] }) {
  return (
    <section id="blog" className="py-20 sm:py-28">
      <Reveal className="mx-auto w-full max-w-5xl px-6">
        <span className="text-xs font-semibold tracking-[0.2em] text-muted uppercase">
          Blog
        </span>
        <p className="mt-4 max-w-2xl text-2xl leading-snug font-medium tracking-tight sm:text-3xl">
          Pensieri, racconti e riflessioni
        </p>
        <Link
          href="/blog"
          className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary transition-opacity hover:opacity-70"
        >
          Vedi tutti →
        </Link>

        {posts.length === 0 ? (
          <p className="mt-10 text-sm text-muted">
            Nessun articolo pubblicato ancora.
          </p>
        ) : (
          <ul className="mt-10 flex flex-col divide-y divide-black/[.06] dark:divide-white/[.08]">
            {posts.map((post) => (
              <li key={post.id} className="py-4">
                <Link href={`/blog/${post.slug}`} className="group block">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-medium tracking-tight transition-opacity group-hover:opacity-70">
                      {post.title}
                    </span>
                    {post.published_at && (
                      <span className="shrink-0 text-xs text-muted">
                        {formatItalianDate(post.published_at)}
                      </span>
                    )}
                  </div>
                  {post.excerpt && (
                    <p className="mt-1 text-sm text-muted">{post.excerpt}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Reveal>
    </section>
  );
}
