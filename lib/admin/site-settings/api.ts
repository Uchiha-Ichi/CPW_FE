import { emptySiteSettings, parseSiteSettings, type SiteSettings } from "@/lib/site/settings-model";
import { ApiError, friendlyMessages } from "@/lib/admin/api-error";
import { toPayload, type SiteSettingsFormValues } from "./form";

const BASE = "/api/admin/proxy";

// Cố ý lặp lại hàm nhỏ này từ post-api.ts vì file đó phải giữ nguyên.
async function request(path: string, init?: RequestInit): Promise<unknown> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, init);
  } catch {
    throw new ApiError(0, friendlyMessages(0, null));
  }
  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  if (!res.ok) throw new ApiError(res.status, friendlyMessages(res.status, body));
  return body;
}

// GET /site-settings/public (công khai, nhưng đi qua proxy như mọi gọi API admin).
export async function getAdminSiteSettings(): Promise<SiteSettings> {
  return parseSiteSettings(await request("/site-settings/public")) ?? emptySiteSettings();
}

// PATCH /site-settings: thay nguyên bản ghi.
export async function saveAdminSiteSettings(values: SiteSettingsFormValues): Promise<SiteSettings> {
  const body = await request("/site-settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toPayload(values)),
  });
  return parseSiteSettings(body) ?? emptySiteSettings();
}
