import Link from "next/link";
import type { Database } from "@/lib/supabase/types";

type BlogCategory = Database["public"]["Tables"]["blog_categories"]["Row"];

export function BlogCategoryFilter({
  categories,
  activeSlug,
}: {
  categories: BlogCategory[];
  activeSlug?: string;
}) {
  if (categories.length === 0) return null;

  const pillClass = (active: boolean) =>
    `shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
      active
        ? "border-primary bg-primary text-white"
        : "border-black/[.12] text-muted hover:border-black/[.24] dark:border-white/[.16] dark:hover:border-white/[.3]"
    }`;

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <Link href="/blog" className={pillClass(!activeSlug)}>
        Tutti
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/blog?category=${category.slug}`}
          className={pillClass(activeSlug === category.slug)}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}
