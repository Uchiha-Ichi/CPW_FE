// Tag cache cho dữ liệu public. `apiGet` gắn tag khi gọi API; route proxy admin xóa tag khi ghi thành công.
export const CACHE_TAGS = {
  pages: "pages",
  posts: "posts",
  jobs: "jobs",
  network: "network",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// `path` là các đoạn sau /api/admin/proxy/, ví dụ ["pages", "home", "publish"].
// Trả các tag mà thao tác ghi này làm dữ liệu public cũ đi; rỗng nếu không ảnh hưởng.
export function tagsForAdminWrite(method: string, path: readonly string[]): CacheTag[] {
  if (!WRITE_METHODS.has(method.toUpperCase())) return [];
  const [resource, , action] = path;
  switch (resource) {
    case "jobs":
      return [CACHE_TAGS.jobs];
    case "posts":
      return [CACHE_TAGS.posts];
    case "network":
      return [CACHE_TAGS.network];
    case "pages":
      // Chỉ publish đổi nội dung public; draft và discard chỉ đổi bản nháp.
      return action === "publish" ? [CACHE_TAGS.pages] : [];
    default:
      return [];
  }
}
