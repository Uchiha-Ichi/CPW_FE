import { parseSiteSettings, type SiteSettings } from "../site/settings-model";
import { apiGet } from "./client";
import { CACHE_TAGS } from "./tags";

// GET /site-settings/public. Lỗi, 404 hoặc dữ liệu hỏng thì trả null: trang public ẩn phần liên hệ chứ không sập.
export async function getSiteSettings(): Promise<SiteSettings | null> {
  const result = await apiGet<unknown>("/site-settings/public", {
    tags: [CACHE_TAGS.siteSettings],
  });
  return result.status === "ok" ? parseSiteSettings(result.data) : null;
}
