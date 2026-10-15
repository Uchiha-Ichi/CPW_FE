import { Link } from "@/i18n/navigation";
import type { PostCategory } from "@/lib/api/posts";
import { buildNewsQuery } from "@/lib/news/params";

const linkClass =
  "rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-primary";
const disabledClass =
  "rounded-full border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground/50";

export function Pagination({
  page,
  totalPages,
  category,
  labels,
}: {
  page: number;
  totalPages: number;
  category?: PostCategory;
  labels: { nav: string; prev: string; next: string; status: string };
}) {
  if (totalPages <= 1) return null;
  const href = (p: number) => `/news${buildNewsQuery({ page: p, category })}`;
  return (
    <nav aria-label={labels.nav} className="mt-12 flex items-center gap-4">
      {page > 1 ? (
        <Link href={href(page - 1)} rel="prev" className={linkClass}>
          {labels.prev}
        </Link>
      ) : (
        <span aria-hidden className={disabledClass}>{labels.prev}</span>
      )}
      <span className="text-sm text-muted-foreground">{labels.status}</span>
      {page < totalPages ? (
        <Link href={href(page + 1)} rel="next" className={linkClass}>
          {labels.next}
        </Link>
      ) : (
        <span aria-hidden className={disabledClass}>{labels.next}</span>
      )}
    </nav>
  );
}
