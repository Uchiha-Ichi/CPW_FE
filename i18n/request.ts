import { notFound } from "next/navigation";
import { lang } from "next/root-params";
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "../lib/i18n/config";

export default getRequestConfig(async ({ locale }) => {
  const resolved = locale ?? (await lang());
  if (!resolved || !hasLocale(resolved)) notFound();
  return {
    locale: resolved,
    messages: (await import(`../messages/${resolved}.json`)).default,
  };
});
