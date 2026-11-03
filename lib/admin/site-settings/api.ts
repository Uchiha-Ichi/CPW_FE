import { emptySiteSettings, parseSiteSettings, type SiteSettings } from "@/lib/site/settings-model";
import { friendlyMessages } from "@/lib/admin/api-error";
import { createAdminRequest, JSON_HEADERS } from "@/lib/admin/request";
import { toPayload, type SiteSettingsFormValues } from "./form";

const request = createAdminRequest(friendlyMessages);

// GET /site-settings/public (công khai, nhưng đi qua proxy như mọi gọi API admin).
export async function getAdminSiteSettings(): Promise<SiteSettings> {
  return parseSiteSettings(await request("/site-settings/public")) ?? emptySiteSettings();
}

// PATCH /site-settings: thay nguyên bản ghi.
export async function saveAdminSiteSettings(values: SiteSettingsFormValues): Promise<SiteSettings> {
  const body = await request("/site-settings", {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify(toPayload(values)),
  });
  return parseSiteSettings(body) ?? emptySiteSettings();
}
