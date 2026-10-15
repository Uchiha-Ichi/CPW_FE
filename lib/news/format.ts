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

// Dạng số dd/MM/yyyy: en dùng en-GB vì en-US đảo tháng/ngày (10/09 đọc nhầm thành 10 tháng 9).
const NUMERIC_TAG: Record<Locale, string> = { vi: "vi-VN", en: "en-GB" };
const VN_TIME_ZONE = "Asia/Ho_Chi_Minh";

function parseIso(iso: string | undefined): Date | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

// "Thứ Sáu, 09/10/2026"
export function formatPostWeekdayDate(iso: string | undefined, lang: Locale): string | undefined {
  const date = parseIso(iso);
  if (!date) return undefined;
  return new Intl.DateTimeFormat(NUMERIC_TAG[lang], {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: VN_TIME_ZONE,
  }).format(date);
}

// "16:57" (24 giờ)
export function formatPostTime(iso: string | undefined, lang: Locale): string | undefined {
  const date = parseIso(iso);
  if (!date) return undefined;
  return new Intl.DateTimeFormat(NUMERIC_TAG[lang], {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: VN_TIME_ZONE,
  }).format(date);
}

// "15:17, 07/10/2026"
export function formatPostDateTime(iso: string | undefined, lang: Locale): string | undefined {
  const date = parseIso(iso);
  if (!date) return undefined;
  const day = new Intl.DateTimeFormat(NUMERIC_TAG[lang], {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: VN_TIME_ZONE,
  }).format(date);
  return `${formatPostTime(iso, lang)}, ${day}`;
}
