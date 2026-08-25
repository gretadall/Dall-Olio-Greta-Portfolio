import { getBlogCategories, getPublishedBlogPostsPage } from "@/lib/queries";
import { BlogCategoryFilter } from "@/components/blog/BlogCategoryFilter";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { BlogPagination } from "@/components/blog/BlogPagination";

const PAGE_SIZE = 8;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const { page: pageParam, category } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [categories, { posts, total }] = await Promise.all([
    getBlogCategories(),
    getPublishedBlogPostsPage({ page, pageSize: PAGE_SIZE, categorySlug: category }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>

      <div className="mt-8">
        <BlogCategoryFilter categories={categories} activeSlug={category} />
      </div>

      {posts.length === 0 ? (
        <p className="mt-12 text-sm text-muted">
          Nessun articolo pubblicato ancora.
        </p>
      ) : (
        <div className="mt-4 flex flex-col">
          {posts.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
        <BlogPagination
          currentPage={page}
          totalPages={totalPages}
          categorySlug={category}
        />
        <span className="text-xs text-muted">
          {total} {total === 1 ? "articolo pubblicato" : "articoli pubblicati"}
        </span>
      </div>
    </div>
  );
}
