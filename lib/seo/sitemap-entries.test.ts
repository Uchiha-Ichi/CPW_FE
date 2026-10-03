import { describe, expect, it } from "vitest";
import { buildSitemapEntries } from "./sitemap-entries";

const siteUrl = "https://example.test";

describe("buildSitemapEntries", () => {
  it("trang cố định có cả vi và en kèm hreflang", () => {
    const entries = buildSitemapEntries({ siteUrl });
    const urls = entries.map((e) => e.url);
    for (const path of ["", "/about", "/news", "/careers", "/contact"]) {
      expect(urls).toContain(`${siteUrl}/vi${path}`);
      expect(urls).toContain(`${siteUrl}/en${path}`);
    }
    const home = entries.find((e) => e.url === `${siteUrl}/vi`);
    expect(home?.alternates?.languages).toEqual({ vi: `${siteUrl}/vi`, en: `${siteUrl}/en` });
  });

  it("bài có bản en: hai URL kèm hreflang và lastModified", () => {
    const entries = buildSitemapEntries({
      siteUrl,
      posts: [{ slug: "bai-1", availableLangs: ["vi", "en"], publishedAt: "2026-09-01T00:00:00.000Z" }],
    });
    const vi = entries.find((e) => e.url === `${siteUrl}/vi/news/bai-1`);
    expect(vi?.lastModified).toBe("2026-09-01T00:00:00.000Z");
    expect(vi?.alternates?.languages).toEqual({
      vi: `${siteUrl}/vi/news/bai-1`,
      en: `${siteUrl}/en/news/bai-1`,
    });
    expect(entries.map((e) => e.url)).toContain(`${siteUrl}/en/news/bai-1`);
  });

  it("bài chỉ có bản vi: một URL, không hreflang, không có URL en", () => {
    const entries = buildSitemapEntries({ siteUrl, posts: [{ slug: "bai-2", availableLangs: ["vi"] }] });
    const e = entries.find((x) => x.url === `${siteUrl}/vi/news/bai-2`);
    expect(e?.alternates).toBeUndefined();
    expect(entries.map((x) => x.url)).not.toContain(`${siteUrl}/en/news/bai-2`);
  });

  it("việc làm chỉ có bản vi", () => {
    const entries = buildSitemapEntries({ siteUrl, jobs: [{ slug: "dev" }] });
    const urls = entries.map((e) => e.url);
    expect(urls).toContain(`${siteUrl}/vi/careers/dev`);
    expect(urls).not.toContain(`${siteUrl}/en/careers/dev`);
  });

  it("bỏ ngôn ngữ lạ trong availableLangs và encode slug", () => {
    const entries = buildSitemapEntries({
      siteUrl,
      posts: [{ slug: "a b", availableLangs: ["vi", "fr"] }],
    });
    const urls = entries.map((e) => e.url);
    expect(urls).toContain(`${siteUrl}/vi/news/a%20b`);
    expect(urls.some((u) => u.includes("/fr/"))).toBe(false);
  });

  it("không có URL trùng", () => {
    const entries = buildSitemapEntries({
      siteUrl,
      posts: [
        { slug: "x", availableLangs: ["vi"] },
        { slug: "x", availableLangs: ["vi"] },
      ],
    });
    const urls = entries.map((e) => e.url);
    expect(new Set(urls).size).toBe(urls.length);
  });
});
