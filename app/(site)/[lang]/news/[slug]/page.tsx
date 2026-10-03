import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CloudinaryImage } from "@/components/blocks/shared/cloudinary-image";
import { PostBody } from "@/components/news/post-body";
import { JsonLd } from "@/components/seo/json-ld";
import { getPostBySlug, POST_CATEGORIES } from "@/lib/api/posts";
import { getSiteSettings } from "@/lib/api/site-settings";
import { Link } from "@/i18n/navigation";
import { hasLocale } from "@/lib/i18n/config";
import { cloudinaryLoader } from "@/lib/images/cloudinary-loader";
import { formatPostDate } from "@/lib/news/format";
import { brandName } from "@/lib/site/contact-info";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { SITE_URL } from "@/lib/seo/site-url";

type Props = { params: Promise<{ lang: string; slug: string }> };

// Slug mới (bài đăng sau lúc build) được dựng theo yêu cầu rồi cache 60 giây.
export const dynamicParams = true;

// Trả [] có chủ đích: lúc build không phụ thuộc trạng thái API (danh sách còn nhưng chi tiết lỗi
// sẽ làm hỏng build). Mỗi trang được dựng ở lần truy cập đầu rồi cache, tái dựng mỗi 60 giây (ISR).
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const result = await getPostBySlug(slug, lang);
  if (result.status !== "ok") return { robots: { index: false, follow: false } };
  const post = result.data;
  const meta = await getTranslations({ locale: lang, namespace: "Meta" });
  return buildMetadata({
    lang,
    path: `/news/${encodeURIComponent(slug)}`,
    title: post.title ?? slug,
    description: post.excerpt ?? meta("news.description"),
    siteName: meta("siteName"),
    siteUrl: SITE_URL,
    type: "article",
    publishedTime: post.publishedAt,
    images: post.cover ? [cloudinaryLoader({ src: post.cover.url, width: 1200 })] : undefined,
    // Chỉ ngôn ngữ mà bài thật sự có bản (spec R11).
    languages: post.availableLangs,
  });
}

export default async function PostPage({ params }: Props) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();

  const result = await getPostBySlug(slug, lang);
  if (result.status === "not-found") notFound();
  // Lỗi tạm thời: ném để error.tsx hiện thông báo; Next giữ bản cache cũ nếu có thay vì lưu trang lỗi.
  if (result.status === "error") throw new Error(`Không tải được bài viết ${slug}`);

  const post = result.data;
  const [t, common, meta, settings] = await Promise.all([
    getTranslations({ locale: lang, namespace: "News" }),
    getTranslations({ locale: lang, namespace: "Common" }),
    getTranslations({ locale: lang, namespace: "Meta" }),
    getSiteSettings(),
  ]);
  const title = post.title ?? slug;
  const url = `${SITE_URL}/${lang}/news/${encodeURIComponent(slug)}`;
  const date = formatPostDate(post.publishedAt, lang);
  const categoryLabel = POST_CATEGORIES.includes(post.category)
    ? t(`categories.${post.category}`)
    : undefined;

  return (
    <article className="mx-auto max-w-3xl px-4 pb-24 pt-28">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: common("home"), url: `${SITE_URL}/${lang}` },
          { name: meta("news.title"), url: `${SITE_URL}/${lang}/news` },
          { name: title, url },
        ])}
      />
      <JsonLd
        data={articleJsonLd({
          siteUrl: SITE_URL,
          url,
          lang,
          headline: title,
          brand: brandName(settings, meta("siteName")),
          description: post.excerpt,
          image: post.cover ? cloudinaryLoader({ src: post.cover.url, width: 1200 }) : undefined,
          datePublished: post.publishedAt,
        })}
      />

      <Link href="/news" className="text-sm text-muted-foreground hover:text-primary">
        {t("backToList")}
      </Link>

      <header className="mt-6">
        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {categoryLabel && <span className="text-primary">{categoryLabel}</span>}
          {date && post.publishedAt && <time dateTime={post.publishedAt}>{date}</time>}
        </div>
        <h1 className="mt-4 font-display text-4xl font-bold leading-[1.15] tracking-[-0.01em] md:text-5xl">
          {title}
        </h1>
        {post.excerpt && (
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{post.excerpt}</p>
        )}
      </header>

      {post.cover && (
        <div className="relative mt-10 aspect-video overflow-hidden rounded-2xl border border-border bg-card">
          <CloudinaryImage
            src={post.cover.url}
            alt={title}
            fill
            preload
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
          />
        </div>
      )}

      <div className="mt-10">
        <PostBody html={post.content ?? ""} />
      </div>
    </article>
  );
}
