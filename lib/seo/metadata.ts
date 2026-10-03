import type { Metadata } from "next";
import { locales, type Locale } from "../i18n/config";

export interface BuildMetadataInput {
  lang: Locale;
  /** "" cho trang chủ; "/about", "/news/abc"... Không có tiền tố ngôn ngữ, không có "/" cuối. */
  path: string;
  title: string;
  description: string;
  siteName: string;
  siteUrl: string;
  /** Dùng title nguyên văn, bỏ template "%s | tên site" của layout. */
  absoluteTitle?: boolean;
  /** Không truyền (hoặc rỗng) thì dùng ảnh OG mặc định của site theo ngôn ngữ. */
  images?: string[];
  type?: "website" | "article";
  /** Các ngôn ngữ có bản của trang này (mặc định cả hai). [] thì không phát hreflang. */
  languages?: readonly Locale[];
  /** Đưa canonical về bản ngôn ngữ khác (việc làm bản en trỏ về bản vi). */
  canonicalLang?: Locale;
  /** Ví dụ "?page=2": chỉ gắn vào canonical, không vào hreflang. */
  query?: string;
  noindex?: boolean;
  publishedTime?: string;
}

const OG_LOCALE: Record<Locale, string> = { vi: "vi_VN", en: "en_US" };

/**
 * Ảnh OG mặc định do `app/(site)/[lang]/og/route.tsx` vẽ (1200x630). URL cố định, không chứa hash
 * build, nên gắn thẳng vào metadata của từng trang: Next thay cả khối `openGraph` của layout bằng
 * khối của trang, nên không thể trông vào ảnh khai báo ở layout.
 */
function defaultOgImages(siteUrl: string, lang: Locale, siteName: string) {
  return [{ url: `${siteUrl}/${lang}/og`, width: 1200, height: 630, type: "image/png", alt: siteName }];
}

export function buildMetadata(input: BuildMetadataInput): Metadata {
  const {
    lang, path, title, description, siteName, siteUrl, absoluteTitle, images,
    type = "website", languages = locales, canonicalLang, query = "", noindex, publishedTime,
  } = input;
  const urlFor = (l: Locale) => `${siteUrl}/${l}${path}`;
  const canonical = `${urlFor(canonicalLang ?? lang)}${query}`;
  const ogImages = images && images.length > 0 ? images : defaultOgImages(siteUrl, lang, siteName);

  const hreflang: Record<string, string> = {};
  for (const l of languages) hreflang[l] = urlFor(l);
  if (languages.length > 0) {
    hreflang["x-default"] = languages.includes("vi") ? urlFor("vi") : urlFor(languages[0]);
  }

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical,
      ...(languages.length > 0 ? { languages: hreflang } : {}),
    },
    openGraph: {
      title,
      description,
      url: urlFor(lang) + query,
      siteName,
      locale: OG_LOCALE[lang],
      type,
      images: ogImages,
      ...(type === "article" && publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages,
    },
    robots: noindex ? { index: false, follow: true } : undefined,
  };
}