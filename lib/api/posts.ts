import { apiGet } from "./client";
import type { ApiResult } from "./result";
import { CACHE_TAGS } from "./tags";
import type { Locale } from "../i18n/config";

export const POST_CATEGORIES = [
  "life-at-company",
  "news",
  "recruitment",
] as const;
export type PostCategory = (typeof POST_CATEGORIES)[number];

export interface PostCover {
  url: string;
  publicId: string;
}

// Hình dạng response của GET /posts (backend: cpw_be/src/posts/posts.service.ts findPublic).
export interface PostSummary {
  _id: string;
  slug: string;
  category: PostCategory;
  cover?: PostCover;
  publishedAt?: string;
  title?: string;
  excerpt?: string;
  availableLangs: Locale[];
}

export interface PostList {
  items: PostSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// GET /posts/:slug (findBySlugPublic): thêm status và content (HTML đã sanitize ở backend).
export interface PostDetail extends PostSummary {
  status: string;
  content?: string;
}

const MAX_PAGE_SIZE = 100; // trùng MAX_PAGE_SIZE của backend (posts.constants.ts)
const MAX_PAGES_TO_LIST = 50;

function isPostList(value: unknown): value is PostList {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return Array.isArray(v.items) && typeof v.totalPages === "number";
}

export async function getPosts(query: {
  lang: Locale;
  page?: number;
  limit?: number;
  category?: PostCategory;
  featured?: boolean;
}): Promise<ApiResult<PostList>> {
  const params = new URLSearchParams({ lang: query.lang });
  if (query.page !== undefined) params.set("page", String(query.page));
  if (query.limit !== undefined) params.set("limit", String(query.limit));
  if (query.category) params.set("category", query.category);
  if (query.featured === true) params.set("featured", "true");
  const result = await apiGet<unknown>(`/posts?${params.toString()}`, {
    tags: [CACHE_TAGS.posts],
  });
  if (result.status !== "ok") return result;
  return isPostList(result.data)
    ? { status: "ok", data: result.data }
    : { status: "error" };
}

export const FEATURED_POST_LIMIT = 5; // trùng giới hạn trong spec 2026-10-13

// Bài nổi bật đã đăng, mới nhất trước (backend lọc theo featured và đã đăng). Không ném lỗi: trạng thái khác "ok" trả nguyên.
export async function getFeaturedPosts(
  lang: Locale
): Promise<ApiResult<PostSummary[]>> {
  const result = await getPosts({
    lang,
    limit: FEATURED_POST_LIMIT,
    featured: true,
  });
  if (result.status !== "ok") return result;
  return { status: "ok", data: result.data.items };
}

export const RELATED_POST_LIMIT = 5;

export interface PostContext {
  related: PostSummary[];
  prev?: PostSummary; // bài cũ hơn cùng chuyên mục
  next?: PostSummary; // bài mới hơn cùng chuyên mục
}

// Backend không có endpoint "bài liên quan": lấy bài cùng chuyên mục (mới nhất trước), thiếu thì bù bài
// chuyên mục khác. Cùng danh sách đó cho Bài trước/Bài sau. Không ném lỗi: lỗi API thì bỏ phần thiếu (tối đa 2 lần gọi).
export async function getPostContext(
  post: Pick<PostSummary, "slug" | "category">,
  lang: Locale
): Promise<PostContext> {
  const sameResult = await getPosts({
    lang,
    category: post.category,
    limit: MAX_PAGE_SIZE,
  });

  if (sameResult.status !== "ok") {
    // Không có danh sách cùng chuyên mục: chỉ lấy tin liên quan toàn site, bỏ Bài trước/Bài sau.
    // Lấy dư 1 bài để sau khi bỏ bài hiện tại vẫn đủ RELATED_POST_LIMIT.
    const siteResult = await getPosts({ lang, limit: RELATED_POST_LIMIT + 1 });
    if (siteResult.status !== "ok") return { related: [] };
    return {
      related: siteResult.data.items
        .filter((item) => item.slug !== post.slug)
        .slice(0, RELATED_POST_LIMIT),
    };
  }

  const sameCategory = sameResult.data.items;
  const related = sameCategory
    .filter((item) => item.slug !== post.slug)
    .slice(0, RELATED_POST_LIMIT);

  if (related.length < RELATED_POST_LIMIT) {
    // Bù từ mọi chuyên mục. Lấy RELATED_POST_LIMIT + sameCategory.length bài vì trong đó tối đa
    // sameCategory.length bài là cùng chuyên mục (kể cả bài hiện tại), nên còn ít nhất RELATED_POST_LIMIT
    // bài khác nếu hệ thống có đủ; lần này lỗi thì giữ phần đã có.
    const siteResult = await getPosts({
      lang,
      limit: RELATED_POST_LIMIT + sameCategory.length,
    });
    if (siteResult.status === "ok") {
      const seen = new Set(related.map((item) => item.slug));
      for (const item of siteResult.data.items) {
        if (related.length >= RELATED_POST_LIMIT) break;
        if (item.slug === post.slug || seen.has(item.slug)) continue;
        related.push(item);
      }
    }
  }

  // Danh sách mới nhất trước: phần tử đứng trước là bài mới hơn. So bằng slug từ API, không dùng tham số route.
  const index = sameCategory.findIndex((item) => item.slug === post.slug);
  return {
    related,
    prev: index >= 0 ? sameCategory[index + 1] : undefined,
    next: index > 0 ? sameCategory[index - 1] : undefined,
  };
}

export async function getPostBySlug(
  slug: string,
  lang: Locale
): Promise<ApiResult<PostDetail>> {
  const result = await apiGet<unknown>(
    `/posts/${encodeURIComponent(slug)}?lang=${lang}`,
    {
      tags: [CACHE_TAGS.posts],
    }
  );
  if (result.status !== "ok") return result;
  const v = result.data;
  if (
    typeof v !== "object" ||
    v === null ||
    typeof (v as { slug?: unknown }).slug !== "string"
  ) {
    return { status: "error" };
  }
  return { status: "ok", data: v as PostDetail };
}

// Toàn bộ bài đã đăng (lấy theo bản vi, mỗi bài có availableLangs). Dùng cho sitemap và generateStaticParams.
// Không ném lỗi: gặp lỗi thì trả phần đã gom được.
export async function listAllPosts(): Promise<PostSummary[]> {
  const all: PostSummary[] = [];
  for (let page = 1; page <= MAX_PAGES_TO_LIST; page += 1) {
    const result = await getPosts({ lang: "vi", page, limit: MAX_PAGE_SIZE });
    if (result.status !== "ok") break;
    all.push(...result.data.items);
    if (page >= result.data.totalPages) break;
  }
  return all;
}
