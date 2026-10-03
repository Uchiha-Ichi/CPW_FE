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
  variant: "featured" | "row";
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
      sizes={featured ? "(min-width: 1024px) 600px, 100vw" : "(min-width: 640px) 200px, 100vw"}
      className="object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-105"
    />
  ) : (
    <ImagePlaceholder label={title} className="h-full border-0" />
  );

  const meta = (
    <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {categoryLabel && <span className="text-primary">{categoryLabel}</span>}
      {date && post.publishedAt && <time dateTime={post.publishedAt}>{date}</time>}
    </div>
  );

  if (featured) {
    return (
      <article className="group">
        <Link href={href} className="block">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-card">
            {cover}
          </div>
          <div className="mt-6 space-y-3">
            {meta}
            <h2 className="font-display text-3xl font-medium leading-[1.2] transition-colors group-hover:text-primary">
              {title}
            </h2>
            {post.excerpt && (
              <p className="line-clamp-3 text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>
            )}
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group">
      <Link
        href={href}
        className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-[0_24px_65px_-40px_rgba(23,125,242,0.34)] sm:flex-row"
      >
        <div className="relative aspect-[4/3] shrink-0 overflow-hidden rounded-xl bg-card sm:aspect-square sm:w-1/3">
          {cover}
        </div>
        <div className="flex flex-col justify-center space-y-2">
          {meta}
          <h3 className="line-clamp-3 text-xl font-medium leading-snug transition-colors group-hover:text-primary">
            {title}
          </h3>
        </div>
      </Link>
    </article>
  );
}
