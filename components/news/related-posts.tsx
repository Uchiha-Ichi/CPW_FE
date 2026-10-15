import { ChevronRight } from "lucide-react";
import { CloudinaryImage } from "@/components/blocks/shared/cloudinary-image";
import { ImagePlaceholder } from "@/components/shared/image-placeholder";
import { Link } from "@/i18n/navigation";
import type { PostCategory, PostSummary } from "@/lib/api/posts";
import type { Locale } from "@/lib/i18n/config";
import { formatPostDateTime } from "@/lib/news/format";

// Cột "Tin liên quan" của trang chi tiết bài viết. Nơi gọi đảm bảo posts không rỗng.
export function RelatedPosts({
  posts,
  lang,
  heading,
  categoryLabels,
}: {
  posts: PostSummary[];
  lang: Locale;
  heading: string;
  categoryLabels: Record<PostCategory, string>;
}) {
  return (
    <aside aria-labelledby="related-posts-heading" className="min-w-0">
      <h2
        id="related-posts-heading"
        className="rounded-t-3xl bg-primary px-6 py-4 text-2xl font-bold leading-[1.2] text-primary-foreground md:text-3xl"
      >
        {heading}
      </h2>
      <ul className="mt-6 grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1">
        {posts.map((post) => (
          <li key={post._id}>
            <RelatedCard post={post} lang={lang} categoryLabel={categoryLabels[post.category]} />
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function RelatedCard({
  post,
  lang,
  categoryLabel,
}: {
  post: PostSummary;
  lang: Locale;
  categoryLabel: string;
}) {
  const title = post.title ?? post.slug;
  const dateTime = formatPostDateTime(post.publishedAt, lang);

  return (
    // Outline focus của link bị overflow-hidden cắt, nên vẽ ring ở article.
    <article className="group overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-[0_24px_65px_-40px_rgba(23,125,242,0.34)] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary">
      <Link href={`/news/${encodeURIComponent(post.slug)}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden border-b-[3px] border-primary bg-card">
          {post.cover ? (
            <CloudinaryImage
              src={post.cover.url}
              alt={title}
              fill
              sizes="(min-width: 1024px) 380px, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-105"
            />
          ) : (
            <ImagePlaceholder label={title} className="h-full border-0" />
          )}
        </div>
        <div className="space-y-3 p-5">
          <div className="flex items-center gap-2 text-sm">
            <span>{categoryLabel}</span>
            <span
              aria-hidden
              className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </span>
          </div>
          <h3 className="line-clamp-2 break-words text-lg font-medium leading-[1.35] text-primary group-hover:underline">
            {title}
          </h3>
          {dateTime && post.publishedAt && (
            <time dateTime={post.publishedAt} className="block text-sm text-muted-foreground">
              {dateTime}
            </time>
          )}
        </div>
      </Link>
    </article>
  );
}
