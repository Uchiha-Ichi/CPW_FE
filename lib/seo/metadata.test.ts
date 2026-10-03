import { describe, expect, it } from "vitest";
import { buildMetadata } from "./metadata";

const base = {
  siteUrl: "https://example.test",
  siteName: "Viễn Chí Bảo",
  title: "Tiêu đề",
  description: "Mô tả",
};

describe("buildMetadata", () => {
  it("trang chủ: canonical theo ngôn ngữ, đủ hreflang và x-default", () => {
    const m = buildMetadata({ ...base, lang: "en", path: "" });
    expect(m.alternates?.canonical).toBe("https://example.test/en");
    expect(m.alternates?.languages).toEqual({
      vi: "https://example.test/vi",
      en: "https://example.test/en",
      "x-default": "https://example.test/vi",
    });
    expect(m.robots).toBeUndefined();
  });

  it("title tuyệt đối khi absoluteTitle", () => {
    expect(buildMetadata({ ...base, lang: "vi", path: "", absoluteTitle: true }).title).toEqual({
      absolute: "Tiêu đề",
    });
    expect(buildMetadata({ ...base, lang: "vi", path: "/about" }).title).toBe("Tiêu đề");
  });

  it("query chỉ vào canonical, không vào hreflang", () => {
    const m = buildMetadata({ ...base, lang: "vi", path: "/news", query: "?page=2" });
    expect(m.alternates?.canonical).toBe("https://example.test/vi/news?page=2");
    expect(m.alternates?.languages).toMatchObject({ vi: "https://example.test/vi/news" });
  });

  it("chỉ liệt kê hreflang cho các ngôn ngữ truyền vào (bài chỉ có bản vi)", () => {
    const m = buildMetadata({ ...base, lang: "vi", path: "/news/abc", languages: ["vi"] });
    expect(m.alternates?.languages).toEqual({
      vi: "https://example.test/vi/news/abc",
      "x-default": "https://example.test/vi/news/abc",
    });
  });

  it("languages rỗng thì không có hreflang", () => {
    const m = buildMetadata({ ...base, lang: "vi", path: "/x", languages: [] });
    expect(m.alternates?.languages).toBeUndefined();
  });

  it("canonicalLang đưa canonical về bản khác (việc làm bản en về bản vi)", () => {
    const m = buildMetadata({ ...base, lang: "en", path: "/careers/abc", canonicalLang: "vi", languages: [] });
    expect(m.alternates?.canonical).toBe("https://example.test/vi/careers/abc");
  });

  it("noindex", () => {
    expect(buildMetadata({ ...base, lang: "vi", path: "", noindex: true }).robots).toEqual({
      index: false,
      follow: true,
    });
  });

  it("Open Graph và Twitter: locale, url, ảnh, bài viết", () => {
    const m = buildMetadata({
      ...base,
      lang: "vi",
      path: "/news/abc",
      type: "article",
      images: ["https://img.test/a.jpg"],
      publishedTime: "2026-09-01T00:00:00.000Z",
    });
    expect(m.openGraph).toMatchObject({
      url: "https://example.test/vi/news/abc",
      locale: "vi_VN",
      type: "article",
      publishedTime: "2026-09-01T00:00:00.000Z",
      images: ["https://img.test/a.jpg"],
    });
    expect(m.twitter).toMatchObject({ card: "summary_large_image", images: ["https://img.test/a.jpg"] });
    expect(buildMetadata({ ...base, lang: "en", path: "" }).openGraph).toMatchObject({ locale: "en_US" });
  });

  it("không truyền images: dùng ảnh OG mặc định của đúng ngôn ngữ (URL cố định), Twitter thẻ lớn", () => {
    for (const lang of ["vi", "en"] as const) {
      const m = buildMetadata({ ...base, lang, path: "/about" });
      const expected = [
        {
          url: `https://example.test/${lang}/og`,
          width: 1200,
          height: 630,
          type: "image/png",
          alt: "Viễn Chí Bảo",
        },
      ];
      expect(m.openGraph?.images).toEqual(expected);
      expect(m.twitter).toMatchObject({ card: "summary_large_image", images: expected });
    }
  });

  it("images rỗng cũng dùng ảnh mặc định", () => {
    const m = buildMetadata({ ...base, lang: "vi", path: "/news/abc", type: "article", images: [] });
    expect(m.openGraph?.images).toEqual([
      { url: "https://example.test/vi/og", width: 1200, height: 630, type: "image/png", alt: "Viễn Chí Bảo" },
    ]);
  });

  it("images truyền vào thay hẳn ảnh mặc định", () => {
    const m = buildMetadata({ ...base, lang: "en", path: "/news/abc", images: ["https://img.test/b.jpg"] });
    expect(m.openGraph?.images).toEqual(["https://img.test/b.jpg"]);
    expect(m.twitter).toMatchObject({ card: "summary_large_image", images: ["https://img.test/b.jpg"] });
  });
});