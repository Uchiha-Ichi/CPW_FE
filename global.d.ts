import type { routing } from "./i18n/routing";
import type vi from "./messages/vi.json";

declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof vi;
  }
}
