import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Calendar, Clock } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { CloudinaryImage } from "@/components/blocks/shared/cloudinary-image";
import { Eyebrow } from "@/components/blocks/shared/eyebrow";
import { PageSection } from "@/components/layout/page-section";
import { PostBody } from "@/components/news/post-body";
import { PostNav } from "@/components/news/post-nav";
import { RelatedPosts } from "@/components/news/related-posts";
import { ShareBar } from "@/components/news/share-bar";
import { JsonLd } from "@/components/seo/json-ld";
import { getPostBySlug, getPostContext, POST_CATEGORIES } from "@/lib/api/posts";
import { getSiteSettings } from "@/lib/api/site-settings";
import { Link } from "@/i18n/navigation";
import { hasLocale } from "@/lib/i18n/config";
import { cloudinaryLoader } from "@/lib/images/cloudinary-loader";
import { formatPostTime, formatPostWeekdayDate } from "@/lib/news/format";
import { brandName } from "@/lib/site/contact-info";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { SITE_URL } from "@/lib/seo/site-url";
import { cn } from "@/lib/utils";

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
  const [t, common, meta, settings, context] = await Promise.all([
    getTranslations({ locale: lang, namespace: "News" }),
    getTranslations({ locale: lang, namespace: "Common" }),
    getTranslations({ locale: lang, namespace: "Meta" }),
    getSiteSettings(),
    getPostContext(post, lang),
  ]);
  const title = post.title ?? slug;
  const url = `${SITE_URL}/${lang}/news/${encodeURIComponent(slug)}`;
  const weekdayDate = formatPostWeekdayDate(post.publishedAt, lang);
  const time = formatPostTime(post.publishedAt, lang);
  // getPostContext không throw; lỗi hoặc hệ thống chỉ có 1 bài thì related rỗng: bài rộng max-w-3xl, không có cột phải.
  const hasRelated = context.related.length > 0;
  const hasNav = Boolean(context.prev || context.next);
  const categoryLabels = {
    news: t("categories.news"),
    "life-at-company": t("categories.life-at-company"),
    recruitment: t("categories.recruitment"),
  };
  // Chuyên mục lạ (không thuộc POST_CATEGORIES) thì bỏ nhãn thay vì hiện khoá thô.
  const categoryLabel = POST_CATEGORIES.includes(post.category)
    ? categoryLabels[post.category]
    : undefined;

  return (
    <>
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

      <PageSection>
        <Link href="/news" className="mb-8 inline-block text-sm text-muted-foreground hover:text-primary">
          {t("backToList")}
        </Link>

        <div className={cn("grid items-start gap-12", hasRelated && "lg:grid-cols-[minmax(0,1fr)_380px]")}>
          <article className={cn("min-w-0", !hasRelated && "max-w-3xl")}>
            <header className="border-b border-border pb-8">
              {categoryLabel && <Eyebrow className="mb-4">{categoryLabel}</Eyebrow>}
              <h1 className="break-words text-4xl font-bold leading-[1.12] md:text-5xl lg:text-6xl">{title}</h1>

              {post.publishedAt && (weekdayDate || time) && (
                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-border py-3 text-sm text-muted-foreground">
                  {weekdayDate && (
                    <span className="inline-flex items-center gap-2">
                      <Calendar aria-hidden className="h-4 w-4" />
                      <time dateTime={post.publishedAt}>{weekdayDate}</time>
                    </span>
                  )}
                  {time && (
                    <span className="inline-flex items-center gap-2">
                      <Clock aria-hidden className="h-4 w-4" />
                      <time dateTime={post.publishedAt}>{time}</time>
                    </span>
                  )}
                </div>
              )}

              {post.excerpt && (
                <p className="mt-6 text-lg font-bold leading-relaxed md:text-justify">{post.excerpt}</p>
              )}
            </header>

            {post.cover && (
              <div className="relative mt-8 aspect-video overflow-hidden rounded-3xl border border-border bg-card">
                <CloudinaryImage
                  src={post.cover.url}
                  alt={title}
                  fill
                  preload
                  sizes="(min-width: 1280px) 780px, (min-width: 1024px) calc(100vw - 460px), 100vw"
                  className="object-cover"
                />
              </div>
            )}

            <div className="mt-8">
              <PostBody html={post.content ?? ""} />
            </div>

            <footer className="mt-12 rounded-3xl border border-border p-6 md:p-8">
              <ShareBar
                url={url}
                title={title}
                labels={{
                  heading: t("share.heading"),
                  copy: t("share.copy"),
                  copied: t("share.copied"),
                  copyFailed: t("share.copyFailed"),
                  share: t("share.native"),
                  shareFailed: t("share.failed"),
                }}
              />
              {hasNav && (
                <div className="mt-6 border-t border-border pt-6">
                  <PostNav
                    prev={context.prev}
                    next={context.next}
                    labels={{ nav: t("nav.label"), prev: t("nav.prev"), next: t("nav.next") }}
                  />
                </div>
              )}
            </footer>
          </article>

          {hasRelated && (
            // Đường kẻ dọc nằm giữa khoảng gap-12 (pseudo-element, không đổi độ rộng cột), chỉ từ lg; self-stretch kéo hết chiều cao hàng.
            <div className="relative self-stretch lg:before:absolute lg:before:-left-6 lg:before:inset-y-0 lg:before:w-px lg:before:bg-border">
              <RelatedPosts
                posts={context.related}
                lang={lang}
                heading={t("related")}
                categoryLabels={categoryLabels}
              />
            </div>
          )}
        </div>
      </PageSection>
    </>
  );
}
