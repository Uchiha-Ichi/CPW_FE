export const locales = ["vi", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "vi";

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
