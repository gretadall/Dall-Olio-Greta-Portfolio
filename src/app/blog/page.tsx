import { getBlogCategories, getPublishedBlogPostsPage, getSiteSettings } from "@/lib/queries";
import { BlogCategoryFilter } from "@/components/blog/BlogCategoryFilter";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { BlogPagination } from "@/components/blog/BlogPagination";
import { EditableText } from "@/components/edit/EditableText";
import { PageBody, PageHeader } from "@/components/PageHeader";

const PAGE_SIZE = 8;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const { page: pageParam, category } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [settings, categories, { posts, total }] = await Promise.all([
    getSiteSettings(),
    getBlogCategories(),
    getPublishedBlogPostsPage({ page, pageSize: PAGE_SIZE, categorySlug: category }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <PageHeader
        label={total === 0 ? "In arrivo" : `${total} ${total === 1 ? "articolo" : "articoli"}`}
        title={
          <EditableText
            value={settings.blog_title ?? "Blog"}
            target={{ table: "site_settings", field: "blog_title" }}
          />
        }
      >
        {categories.length > 0 && (
          <div className="mt-10">
            <BlogCategoryFilter categories={categories} activeSlug={category} />
          </div>
        )}
      </PageHeader>

      <PageBody>
        {posts.length === 0 ? (
          <EditableText
            as="p"
            className="text-muted"
            value={settings.blog_empty_text ?? "Nessun articolo pubblicato ancora."}
            target={{ table: "site_settings", field: "blog_empty_text" }}
          />
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {posts.map((post) => (
              <li key={post.id}>
                <BlogPostCard post={post} />
              </li>
            ))}
          </ul>
        )}

        <div className="mt-10">
          <BlogPagination currentPage={page} totalPages={totalPages} categorySlug={category} />
        </div>
      </PageBody>
    </>
  );
}
