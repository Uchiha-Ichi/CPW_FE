import type { Locale } from "../i18n/config";

const LOCALE_TAG: Record<Locale, string> = { vi: "vi-VN", en: "en-US" };

// Cố định múi giờ Việt Nam: render ở server nên mọi người dùng thấy cùng một ngày, không lệch hydration.
export function formatPostDate(iso: string | undefined, lang: Locale): string | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return undefined;
  return new Intl.DateTimeFormat(LOCALE_TAG[lang], {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);
}
