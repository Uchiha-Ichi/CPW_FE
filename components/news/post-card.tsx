import { CloudinaryImage } from "@/components/blocks/shared/cloudinary-image";
import { ImagePlaceholder } from "@/components/shared/image-placeholder";
import { Link } from "@/i18n/navigation";
import type { PostSummary } from "@/lib/api/posts";
import type { Locale } from "@/lib/i18n/config";
import { formatPostDate } from "@/lib/news/format";

export function PostCard({
  post,
  lang,
  categoryLabel,
  variant,
}: {
  post: PostSummary;
  lang: Locale;
  categoryLabel?: string;
  variant: "featured" | "compact";
}) {
  const title = post.title ?? post.slug;
  const date = formatPostDate(post.publishedAt, lang);
  const href = `/news/${encodeURIComponent(post.slug)}`;
  const featured = variant === "featured";

  const cover = post.cover ? (
    <CloudinaryImage
      src={post.cover.url}
      alt={title}
      fill
      preload={featured}
      sizes={featured ? "(min-width: 1024px) 720px, 100vw" : "(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"}
      className="object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-105"
    />
  ) : (
    <ImagePlaceholder label={title} className="h-full border-0" />
  );

  const meta = (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {categoryLabel && <span className="text-primary">{categoryLabel}</span>}
      {date && post.publishedAt && <time dateTime={post.publishedAt}>{date}</time>}
    </div>
  );

  if (featured) {
    return (
      <article className="group">
        <Link href={href} className="grid gap-5 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:gap-10">
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-border bg-card">
            {cover}
          </div>
          <div className="space-y-3">
            {meta}
            <h2 className="text-xl font-bold leading-[1.2] transition-colors group-hover:text-primary md:text-2xl lg:text-3xl">
              {title}
            </h2>
            {post.excerpt && (
              <p className="line-clamp-3 leading-relaxed text-muted-foreground">{post.excerpt}</p>
            )}
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group">
      <Link href={href} className="block">
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-card">
          {cover}
        </div>
        <div className="mt-4 space-y-2">
          {meta}
          <h3 className="-mt-1 line-clamp-2 pt-1 text-lg font-bold leading-[1.3] transition-colors group-hover:text-primary">
            {title}
          </h3>
        </div>
      </Link>
    </article>
  );
}
