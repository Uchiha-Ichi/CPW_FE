import type { Locale } from "@/lib/i18n/config";

export interface BlockProps {
  data: Record<string, unknown>;
  lang: Locale;
}
