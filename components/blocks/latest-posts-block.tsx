import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "./shared/reveal";
import { BlockHead } from "./shared/block-head";
import { BLOCK_SECTION, BLOCK_WRAP } from "@/lib/blocks/rhythm";
import { RelatedCard } from "@/components/news/related-posts";
import { Link } from "@/i18n/navigation";
import { getPosts, POST_CATEGORIES } from "@/lib/api/posts";
import { str } from "@/lib/blocks/read";
import type { BlockProps } from "./types";

const LATEST_POST_LIMIT = 3;

// Danh sách bài lấy từ GET /posts?category=… (mới nhất trước), không nằm trong dữ liệu block.
// Không có bài, chuyên mục lạ, hoặc backend tắt/lỗi: ẩn hẳn block (như featured-news).
export async function LatestPostsBlock({ data, lang }: BlockProps) {
  const title = str(data.title);
  const category = POST_CATEGORIES.find((c) => c === data.category);
  if (!title || !category) return null;

  const result = await getPosts({ lang, category, limit: LATEST_POST_LIMIT });
  if (result.status !== "ok" || result.data.items.length === 0) return null;

  const [t, news] = await Promise.all([
    getTranslations({ locale: lang, namespace: "FeaturedNews" }),
    getTranslations({ locale: lang, namespace: "News" }),
  ]);

  return (
    <section className={BLOCK_SECTION}>
      <div className={BLOCK_WRAP}>
        <Reveal>
          <BlockHead title={title} />
        </Reveal>
        <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {result.data.items.slice(0, LATEST_POST_LIMIT).map((post, i) => (
            <li key={post._id}>
              <Reveal delay={i * 80}>
                <RelatedCard post={post} lang={lang} categoryLabel={news(`categories.${post.category}`)} />
              </Reveal>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex justify-end">
          <Link
            href={`/news?category=${category}`}
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:border-primary hover:text-primary motion-safe:transition-colors"
          >
            {t("viewAll")}
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
