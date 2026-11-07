// Tag cache cho dữ liệu public. `apiGet` gắn tag khi gọi API; backend báo xoá tag sau khi admin ghi thành công
// (app/api/revalidate/route.ts). Đổi tên tag thì đổi cả cpw_be/src/common/revalidate/fe-cache-tags.ts.
export const CACHE_TAGS = {
  pages: "pages",
  posts: "posts",
  jobs: "jobs",
  network: "network",
  products: "products",
  siteSettings: "site-settings",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];
