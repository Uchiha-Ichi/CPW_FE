import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CategoryFilter } from "@/components/news/category-filter";
import { Pagination } from "@/components/news/pagination";
import { PostCard } from "@/components/news/post-card";
import { JsonLd } from "@/components/seo/json-ld";
import { getPosts } from "@/lib/api/posts";
import { hasLocale } from "@/lib/i18n/config";
import { buildNewsQuery, parseCategory, parsePage } from "@/lib/news/params";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { SITE_URL } from "@/lib/seo/site-url";

type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ page?: string | string[]; category?: string | string[] }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const sp = await searchParams;
  const category = parseCategory(sp.category);
  const t = await getTranslations({ locale: lang, namespace: "Meta" });
  return buildMetadata({
    lang,
    path: "/news",
    query: buildNewsQuery({ page: parsePage(sp.page), category }),
    title: t("news.title"),
    description: t("news.description"),
    siteName: t("siteName"),
    siteUrl: SITE_URL,
    noindex: category !== undefined,
  });
}

export default async function NewsPage({ params, searchParams }: Props) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const category = parseCategory(sp.category);

  const [t, common, meta, result] = await Promise.all([
    getTranslations({ locale: lang, namespace: "News" }),
    getTranslations({ locale: lang, namespace: "Common" }),
    getTranslations({ locale: lang, namespace: "Meta" }),
    getPosts({ lang, page, category }),
  ]);

  // Trang vượt tổng số trang (kể cả khi không có bài nào mà page > 1) là 404.
  if (result.status === "ok" && page > Math.max(1, result.data.totalPages)) notFound();

  const labels = {
    all: t("categories.all"),
    news: t("categories.news"),
    "life-at-company": t("categories.life-at-company"),
    recruitment: t("categories.recruitment"),
  };
  const items = result.status === "ok" ? result.data.items : [];
  const [featured, ...rest] = items;

  return (
    <div className="pb-20 pt-24">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: common("home"), url: `${SITE_URL}/${lang}` },
          { name: meta("news.title"), url: `${SITE_URL}/${lang}/news` },
        ])}
      />

      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <div className="mb-6 inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.22em] text-primary">
          <span className="h-px w-10 bg-primary" />
          {t("eyebrow")}
        </div>
        <h1 className="font-display text-5xl font-bold leading-[1.1] tracking-[-0.01em] md:text-6xl">
          {t.rich("title", { em: (chunks) => <em className="not-italic text-primary">{chunks}</em> })}
        </h1>
        <p className="mx-auto mt-8 max-w-[55ch] text-lg leading-relaxed text-muted-foreground">{t("lead")}</p>
      </section>

      <CategoryFilter active={category} label={t("categoriesLabel")} labels={labels} />

      <section className="mx-auto mt-12 max-w-[1240px] px-4">
        {result.status === "error" ? (
          <p role="status" className="py-12 text-center text-muted-foreground">{t("error")}</p>
        ) : !featured ? (
          <p className="py-12 text-center text-muted-foreground">{t("empty")}</p>
        ) : (
          <div className="grid gap-10 lg:grid-cols-2">
            <PostCard post={featured} lang={lang} variant="featured" categoryLabel={labels[featured.category]} />
            <div className="flex flex-col gap-6">
              {rest.map((post) => (
                <PostCard key={post._id} post={post} lang={lang} variant="row" categoryLabel={labels[post.category]} />
              ))}
            </div>
          </div>
        )}

        {result.status === "ok" && (
          <Pagination
            page={page}
            totalPages={result.data.totalPages}
            category={category}
            labels={{
              nav: t("pagination.label"),
              prev: t("pagination.prev"),
              next: t("pagination.next"),
              status: t("pagination.status", { page, total: result.data.totalPages }),
            }}
          />
        )}
      </section>
    </div>
  );
}
