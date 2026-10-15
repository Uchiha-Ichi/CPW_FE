import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { PostSummary } from "@/lib/api/posts";

const CARD_CLASS =
  "group block min-w-0 rounded-3xl border border-border bg-card p-6 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

// Bài trước (cũ hơn) / Bài sau (mới hơn) trong cùng chuyên mục. Không có cả hai thì ẩn khối.
export function PostNav({
  prev,
  next,
  labels,
}: {
  prev?: PostSummary;
  next?: PostSummary;
  labels: { nav: string; prev: string; next: string };
}) {
  if (!prev && !next) return null;

  return (
    <nav aria-label={labels.nav}>
      <div className="grid gap-6 sm:grid-cols-2">
        {prev && (
          <Link href={`/news/${encodeURIComponent(prev.slug)}`} className={CARD_CLASS}>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <ChevronLeft aria-hidden className="h-4 w-4" />
              {labels.prev}
            </span>
            <span className="mt-2 line-clamp-2 break-words text-lg font-semibold leading-[1.3]">
              {prev.title ?? prev.slug}
            </span>
          </Link>
        )}
        {next && (
          // Chỉ có bài sau thì vẫn nằm cột phải, cột trái để trống.
          <Link
            href={`/news/${encodeURIComponent(next.slug)}`}
            className={`${CARD_CLASS} sm:col-start-2 sm:text-right`}
          >
            <span className="flex items-center gap-1 text-sm text-muted-foreground sm:justify-end">
              {labels.next}
              <ChevronRight aria-hidden className="h-4 w-4" />
            </span>
            <span className="mt-2 line-clamp-2 break-words text-lg font-semibold leading-[1.3]">
              {next.title ?? next.slug}
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}
