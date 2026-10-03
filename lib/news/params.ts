import { POST_CATEGORIES, type PostCategory } from "../api/posts";

const MAX_PAGE = 10_000;

const first = (raw: string | string[] | undefined): string | undefined =>
  Array.isArray(raw) ? raw[0] : raw;

// "?page=": chỉ nhận chuỗi toàn chữ số ASCII dương; còn lại coi như trang 1.
// Số quá lớn bị chặn ở MAX_PAGE; trang vượt tổng số trang sẽ bị trang tin tức trả 404.
export function parsePage(raw: string | string[] | undefined): number {
  const value = first(raw);
  if (!value || !/^[0-9]+$/.test(value)) return 1;
  const n = Number(value);
  if (n < 1) return 1;
  return n > MAX_PAGE ? MAX_PAGE : n;
}

export function parseCategory(raw: string | string[] | undefined): PostCategory | undefined {
  const value = first(raw);
  return POST_CATEGORIES.find((c) => c === value);
}

export function buildNewsQuery({
  page,
  category,
}: {
  page?: number;
  category?: PostCategory;
}): string {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (page && page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `?${query}` : "";
}
