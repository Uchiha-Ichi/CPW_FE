import {
  SOCIAL_KEYS,
  type SiteSettings,
  type SocialKey,
} from "./settings-model";

export const SOCIAL_LABELS: Record<SocialKey, string> = {
  zalo: "Zalo",
  tiktok: "TikTok",
  facebook: "Facebook",
  youtube: "YouTube",
  instagram: "Instagram",
  threads: "Threads",
};

export type VisibleSocial = { key: SocialKey; label: string; url: string };

// Mạng nào admin chưa điền link thì không có trong kết quả. Thứ tự cố định theo SOCIAL_KEYS.
export function visibleSocials(settings: SiteSettings | null): VisibleSocial[] {
  if (!settings) return [];
  return SOCIAL_KEYS.flatMap((key) => {
    const url = settings.socials[key];
    return url ? [{ key, label: SOCIAL_LABELS[key], url }] : [];
  });
}
