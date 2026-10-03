// Kiểu và bộ chuẩn hóa dữ liệu thông tin liên hệ. Thuần (không import gì), dùng được cả ở server lẫn client.
export const SOCIAL_KEYS = [
  "zalo",
  "tiktok",
  "facebook",
  "youtube",
  "instagram",
  "threads",
] as const;
export type SocialKey = (typeof SOCIAL_KEYS)[number];

export const OFFICE_KEYS = ["headquarters", "showroom"] as const;
export type OfficeKey = (typeof OFFICE_KEYS)[number];

export type Office = { street?: string; city?: string };

export type SiteSettings = {
  name?: string;
  taxId?: string;
  phone?: string;
  email?: string;
  socials: Partial<Record<SocialKey, string>>;
  offices: Partial<Record<OfficeKey, Office>>;
};

// Cùng quy tắc với HTTPS_URL_PATTERN của backend: chặn javascript:, http:// và link rỗng.
export const HTTPS_URL = /^https:\/\/[^\s/]\S*$/;

export const emptySiteSettings = (): SiteSettings => ({
  socials: {},
  offices: {},
});

const text = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

const record = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

// Chuẩn hóa JSON từ API. Không phải object thì trả null. Link mạng xã hội không phải https bị bỏ
// (phòng dữ liệu DB bị sửa tay), vì chúng được đặt vào href.
export function parseSiteSettings(raw: unknown): SiteSettings | null {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw))
    return null;
  const input = raw as Record<string, unknown>;
  const settings = emptySiteSettings();

  for (const field of ["name", "taxId", "phone", "email"] as const) {
    const value = text(input[field]);
    if (value !== undefined) settings[field] = value;
  }

  const socials = record(input.socials);
  for (const key of SOCIAL_KEYS) {
    const value = text(socials[key]);
    if (value !== undefined && HTTPS_URL.test(value))
      settings.socials[key] = value;
  }

  const offices = record(input.offices);
  for (const key of OFFICE_KEYS) {
    const office = record(offices[key]);
    const street = text(office.street);
    const city = text(office.city);
    if (street !== undefined || city !== undefined) {
      settings.offices[key] = {
        ...(street !== undefined ? { street } : {}),
        ...(city !== undefined ? { city } : {}),
      };
    }
  }

  return settings;
}
