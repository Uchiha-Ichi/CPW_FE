import { defineRouting } from "next-intl/routing";
import { defaultLocale, locales } from "../lib/i18n/config";

// Luôn có tiền tố ngôn ngữ (/vi, /en). Tắt cookie ngôn ngữ để trang cache được và URL là nguồn duy nhất;
// tắt header Link hreflang vì hreflang đã nằm trong Metadata (alternates.languages).
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
  localeCookie: false,
  alternateLinks: false,
});
