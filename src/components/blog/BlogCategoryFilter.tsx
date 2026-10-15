import Link from "next/link";
import type { Database } from "@/lib/supabase/types";
import { T } from "@/components/UiTexts";

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
    `shrink-0 rounded-full border px-4 py-1.5 text-sm transition-colors ${
      active
        ? "border-primary text-primary"
        : "border-line text-muted hover:border-foreground/40 hover:text-foreground"
    }`;

  return (
    <nav aria-label="Categorie" className="flex gap-2 overflow-x-auto pb-1">
      <Link href="/blog" className={pillClass(!activeSlug)} aria-current={!activeSlug ? "page" : undefined}>
        <T k="blog.all" />
      </Link>
      {categories.map((category) => {
        const active = activeSlug === category.slug;
        return (
          <Link
            key={category.id}
            href={`/blog?category=${category.slug}`}
            className={pillClass(active)}
            aria-current={active ? "page" : undefined}
          >
            {category.name}
          </Link>
        );
      })}
    </nav>
  );
}
