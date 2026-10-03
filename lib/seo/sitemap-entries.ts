import { hasLocale, locales, type Locale } from "../i18n/config";

export interface SitemapEntry {
  url: string;
  lastModified?: string;
  alternates?: { languages: Record<string, string> };
}

export interface SitemapPost {
  slug: string;
  availableLangs: readonly string[];
  publishedAt?: string;
}

export interface SitemapJob {
  slug: string;
}

const STATIC_PATHS = ["", "/about", "/news", "/careers", "/contact"];

export function buildSitemapEntries({
  siteUrl,
  posts = [],
  jobs = [],
}: {
  siteUrl: string;
  posts?: SitemapPost[];
  jobs?: SitemapJob[];
}): SitemapEntry[] {
  const entries: SitemapEntry[] = [];
  const seen = new Set<string>();

  const push = (path: string, langs: readonly Locale[], lastModified?: string) => {
    const languages =
      langs.length > 1
        ? Object.fromEntries(langs.map((l) => [l, `${siteUrl}/${l}${path}`]))
        : undefined;
    for (const l of langs) {
      const url = `${siteUrl}/${l}${path}`;
      if (seen.has(url)) continue;
      seen.add(url);
      entries.push({
        url,
        ...(lastModified ? { lastModified } : {}),
        ...(languages ? { alternates: { languages } } : {}),
      });
    }
  };

  for (const path of STATIC_PATHS) push(path, locales);
  for (const post of posts) {
    push(`/news/${encodeURIComponent(post.slug)}`, post.availableLangs.filter(hasLocale), post.publishedAt);
  }
  // Việc làm chỉ có tiếng Việt (spec R9): không có bản en, không hreflang.
  for (const job of jobs) push(`/careers/${encodeURIComponent(job.slug)}`, ["vi"]);
  return entries;
}
