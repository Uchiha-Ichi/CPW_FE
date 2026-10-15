import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "../shared/reveal";
import { SectionHead } from "../shared/section-head";
import { FeaturedNewsCarousel, type FeaturedNewsItem } from "./featured-news-carousel";
import { Link } from "@/i18n/navigation";
import { getFeaturedPosts } from "@/lib/api/posts";
import { str } from "@/lib/blocks/read";
import { formatPostDate } from "@/lib/news/format";
import type { BlockProps } from "../types";

// Danh sách bài lấy từ GET /posts?featured=true (tối đa 5, mới nhất trước), không nằm trong dữ liệu block.
// Không có bài nổi bật, hoặc backend tắt/lỗi: ẩn hẳn block.
export async function FeaturedNewsBlock({ data, lang }: BlockProps) {
  const title = str(data.title);
  if (!title) return null;

  const result = await getFeaturedPosts(lang);
  if (result.status !== "ok" || result.data.length === 0) return null;

  const [t, news] = await Promise.all([
    getTranslations({ locale: lang, namespace: "FeaturedNews" }),
    getTranslations({ locale: lang, namespace: "News" }),
  ]);

  // Ngày format ở server (múi giờ cố định) để client hydrate ra đúng cùng chữ.
  const items: FeaturedNewsItem[] = result.data.map((post) => {
    const dateLabel = formatPostDate(post.publishedAt, lang);
    return {
      slug: post.slug,
      title: post.title ?? post.slug,
      coverUrl: post.cover?.url,
      categoryLabel: news(`categories.${post.category}`),
      dateLabel,
      dateTime: dateLabel ? post.publishedAt : undefined,
    };
  });
  const total = items.length;

  return (
    <section className="border-b border-border py-12 md:py-16">
      <div className="mx-auto max-w-[1240px] px-4">
        <Reveal>
          <SectionHead title={title} flush />
        </Reveal>
        <Reveal className="mt-8 md:mt-10">
          <FeaturedNewsCarousel
            items={items}
            labels={{
              region: t("region"),
              slide: items.map((_, i) => t("slide", { n: i + 1, total })),
              detail: t("detail"),
            }}
          />
          <div className="mt-6 flex justify-end">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:border-primary hover:text-primary motion-safe:transition-colors"
            >
              {t("viewAll")}
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
