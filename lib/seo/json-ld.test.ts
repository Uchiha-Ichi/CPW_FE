import { describe, expect, it } from "vitest";
import type { SiteSettings } from "../site/settings-model";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  contactJsonLd,
  jobPostingJsonLd,
  organizationId,
  organizationJsonLd,
  serializeJsonLd,
  webSiteJsonLd,
} from "./json-ld";

const siteUrl = "https://example.test";
const brand = "Viễn Chí Bảo";

const full: SiteSettings = {
  name: "Viễn Chí Bảo",
  taxId: "0107994675",
  phone: "086.836.6662",
  email: "vienchibao6868@gmail.com",
  socials: { tiktok: "https://www.tiktok.com/@vienchibao.official", zalo: "https://zalo.me/0945366662" },
  offices: {
    headquarters: { street: "39 Cầu Diễn, Xuân Phương", city: "Hà Nội" },
    showroom: { street: "39 Xã Đàn, Kim Liên", city: "Hà Nội" },
  },
};
const empty: SiteSettings = { socials: {}, offices: {} };

describe("serializeJsonLd", () => {
  it("escape < để không thoát được thẻ script", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("<");
    expect(JSON.parse(out).name).toBe("</script><script>alert(1)</script>");
  });

  it("escape U+2028 và U+2029", () => {
    const out = serializeJsonLd({ a: "x\u2028y\u2029z" });
    expect(out).not.toMatch(/[\u2028\u2029]/);
    expect(JSON.parse(out).a).toBe("x\u2028y\u2029z");
  });
});

describe("organizationJsonLd", () => {
  it("có @id ổn định, tên, URL, điện thoại quốc tế, email, MST, sameAs và địa chỉ VN", () => {
    // WithContext<Organization> là union cả kiểu chuỗi: đọc qua bản JSON thuần để kiểm giá trị.
    const o = JSON.parse(JSON.stringify(organizationJsonLd(siteUrl, brand, full))) as Record<string, unknown>;
    expect(o["@context"]).toBe("https://schema.org");
    expect(o["@type"]).toBe("Organization");
    expect(o["@id"]).toBe(organizationId(siteUrl));
    expect(o.name).toBe("Viễn Chí Bảo");
    expect(o.url).toBe(siteUrl);
    expect(o.telephone).toBe("+84868366662");
    expect(o.email).toBe("vienchibao6868@gmail.com");
    expect(o.taxID).toBe("0107994675");
    expect(o.sameAs).toEqual([
      "https://zalo.me/0945366662",
      "https://www.tiktok.com/@vienchibao.official",
    ]);
    expect(JSON.stringify(o)).toContain('"addressCountry":"VN"');
    expect(JSON.stringify(o)).toContain("39 Cầu Diễn, Xuân Phương");
  });

  it("settings null hoặc rỗng: chỉ còn tên, URL, logo; không có chuỗi rỗng", () => {
    for (const settings of [null, empty]) {
      const o = JSON.parse(JSON.stringify(organizationJsonLd(siteUrl, brand, settings))) as Record<string, unknown>;
      expect(o.name).toBe("Viễn Chí Bảo");
      expect(o.url).toBe(siteUrl);
      expect(o.logo).toBeTruthy();
      for (const key of ["telephone", "email", "taxID", "sameAs", "address"]) {
        expect(o).not.toHaveProperty(key);
      }
    }
  });

  it("cơ sở chỉ có street thì địa chỉ không có addressLocality; chỉ có city thì không có địa chỉ", () => {
    const streetOnly = JSON.stringify(
      organizationJsonLd(siteUrl, brand, { socials: {}, offices: { headquarters: { street: "39 Cầu Diễn" } } }),
    );
    expect(streetOnly).toContain("39 Cầu Diễn");
    expect(streetOnly).not.toContain("addressLocality");
    const cityOnly = JSON.stringify(
      organizationJsonLd(siteUrl, brand, { socials: {}, offices: { headquarters: { city: "Hà Nội" } } }),
    );
    expect(cityOnly).not.toContain("address");
  });
});

describe("webSiteJsonLd", () => {
  it("trỏ publisher về Organization và liệt kê hai ngôn ngữ", () => {
    const w = webSiteJsonLd(siteUrl, brand);
    expect(w["@type"]).toBe("WebSite");
    expect(w.name).toBe("Viễn Chí Bảo");
    expect(w.url).toBe(siteUrl);
    expect(w.inLanguage).toEqual(["vi", "en"]);
    expect(JSON.stringify(w)).toContain(organizationId(siteUrl));
  });
});

describe("breadcrumbJsonLd", () => {
  it("đánh số position từ 1 và giữ thứ tự", () => {
    const b = breadcrumbJsonLd([
      { name: "Trang chủ", url: "https://example.test/vi" },
      { name: "Tin tức", url: "https://example.test/vi/news" },
    ]);
    expect(b["@type"]).toBe("BreadcrumbList");
    const items = JSON.parse(JSON.stringify(b.itemListElement)) as {
      position: number;
      name: string;
      item: string;
    }[];
    expect(items.map((i) => i.position)).toEqual([1, 2]);
    expect(items[1]).toMatchObject({ name: "Tin tức", item: "https://example.test/vi/news" });
  });
});

describe("articleJsonLd", () => {
  const base = {
    siteUrl,
    url: "https://example.test/vi/news/bai-1",
    lang: "vi" as const,
    headline: "Tiêu đề bài",
    brand,
  };

  it("có đủ field bắt buộc và publisher là tổ chức", () => {
    const a = articleJsonLd({
      ...base,
      description: "Mô tả",
      image: "https://img.test/a.jpg",
      datePublished: "2026-09-01T00:00:00.000Z",
    });
    expect(a["@type"]).toBe("Article");
    expect(a.headline).toBe("Tiêu đề bài");
    expect(a.inLanguage).toBe("vi");
    expect(a.datePublished).toBe("2026-09-01T00:00:00.000Z");
    expect(a.image).toEqual(["https://img.test/a.jpg"]);
    expect(JSON.stringify(a)).toContain("Viễn Chí Bảo");
  });

  it("dùng tên thương hiệu được truyền vào", () => {
    expect(JSON.stringify(articleJsonLd({ ...base, brand: "Tên khác" }))).toContain("Tên khác");
  });

  it("bỏ field tùy chọn khi thiếu (không bịa giá trị)", () => {
    const a = articleJsonLd(base);
    expect(a).not.toHaveProperty("image");
    expect(a).not.toHaveProperty("description");
    expect(a).not.toHaveProperty("datePublished");
  });
});

describe("jobPostingJsonLd", () => {
  const job = {
    slug: "dev",
    title: "Lập trình viên",
    department: "Công nghệ",
    location: "Hà Nội",
    type: "Toàn thời gian",
    status: "Đang tuyển",
    description: "Mô tả công việc",
    createdAt: "2026-09-01T00:00:00.000Z",
  };
  const url = "https://example.test/vi/careers/dev";

  it("không có mô tả thì không phát JSON-LD (trả null)", () => {
    expect(jobPostingJsonLd({ siteUrl, url, brand, job: { ...job, description: undefined } })).toBeNull();
    expect(jobPostingJsonLd({ siteUrl, url, brand, job: { ...job, description: "  " } })).toBeNull();
  });

  it("map hình thức, ngày đăng, địa điểm Hà Nội và tên tổ chức tuyển", () => {
    const j = jobPostingJsonLd({ siteUrl, url, brand, job });
    expect(j?.["@type"]).toBe("JobPosting");
    expect(j?.title).toBe("Lập trình viên");
    expect(j?.employmentType).toBe("FULL_TIME");
    expect(j?.datePosted).toBe("2026-09-01T00:00:00.000Z");
    expect(JSON.stringify(j)).toContain('"addressLocality":"Hà Nội"');
    expect(JSON.stringify(j)).toContain("Viễn Chí Bảo");
    expect(j).not.toHaveProperty("jobLocationType");
  });

  it("Remote / Quốc tế thì TELECOMMUTE và không có jobLocation", () => {
    const j = jobPostingJsonLd({ siteUrl, url, brand, job: { ...job, location: "Remote / Quốc tế" } });
    expect(j?.jobLocationType).toBe("TELECOMMUTE");
    expect(j).not.toHaveProperty("jobLocation");
  });

  it("thiếu createdAt hoặc hình thức lạ thì bỏ field, không bịa", () => {
    const j = jobPostingJsonLd({
      siteUrl,
      url,
      brand,
      job: { ...job, createdAt: undefined, type: "Khác" },
    });
    expect(j).not.toHaveProperty("datePosted");
    expect(j).not.toHaveProperty("employmentType");
  });
});

describe("contactJsonLd", () => {
  const url = "https://example.test/vi/contact";

  it("đủ dữ liệu: một ContactPage và hai LocalBusiness", () => {
    const nodes = contactJsonLd({ siteUrl, url, brand, settings: full });
    // WithContext<LocalBusiness> là union cả kiểu chuỗi: đọc qua bản JSON thuần để kiểm giá trị.
    const types = (JSON.parse(JSON.stringify(nodes)) as { "@type": string }[]).map((n) => n["@type"]);
    expect(types).toEqual(["ContactPage", "LocalBusiness", "LocalBusiness"]);
  });

  it("LocalBusiness có điện thoại quốc tế, địa chỉ VN và trỏ về tổ chức", () => {
    const nodes = contactJsonLd({ siteUrl, url, brand, settings: full });
    const text = JSON.stringify(nodes[1]);
    expect(text).toContain("+84868366662");
    expect(text).toContain('"addressCountry":"VN"');
    expect(text).toContain(organizationId(siteUrl));
    expect(JSON.stringify(nodes[2])).toContain("39 Xã Đàn, Kim Liên");
  });

  it("cơ sở thiếu street bị bỏ; settings null thì chỉ còn ContactPage", () => {
    const onlyOne = contactJsonLd({
      siteUrl,
      url,
      brand,
      settings: { socials: {}, offices: { headquarters: { city: "Hà Nội" }, showroom: { street: "39 Xã Đàn" } } },
    });
    expect(onlyOne).toHaveLength(2);
    expect(JSON.stringify(onlyOne[1])).toContain("39 Xã Đàn");
    expect(JSON.stringify(onlyOne[1])).not.toContain("telephone");

    const none = contactJsonLd({ siteUrl, url, brand, settings: null });
    expect(none).toHaveLength(1);
    expect(JSON.parse(JSON.stringify(none[0]))["@type"]).toBe("ContactPage");
  });
});
