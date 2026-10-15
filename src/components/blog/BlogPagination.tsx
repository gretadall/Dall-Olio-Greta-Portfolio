import Link from "next/link";

export function BlogPagination({
  currentPage,
  totalPages,
  categorySlug,
}: {
  currentPage: number;
  totalPages: number;
  categorySlug?: string;
}) {
  if (totalPages < 2) return null;

  function href(page: number) {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (categorySlug) params.set("category", categorySlug);
    const qs = params.toString();
    return qs ? `/blog?${qs}` : "/blog";
  }

  return (
    <nav aria-label="Paginazione" className="flex flex-wrap gap-2">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Link
          key={page}
          href={href(page)}
          className={`flex h-9 w-9 items-center justify-center rounded-md border font-mono text-xs transition-colors ${
            page === currentPage
              ? "border-primary text-primary"
              : "border-line text-muted hover:text-foreground"
          }`}
        >
          {page}
        </Link>
      ))}
    </nav>
  );
}
