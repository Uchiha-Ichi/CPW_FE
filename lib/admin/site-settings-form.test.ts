import { describe, expect, it } from "vitest";
import {
  emptyFormValues,
  fromSettings,
  siteSettingsFormSchema,
  toPayload,
  type SiteSettingsFormValues,
} from "./site-settings-form";

function values(over: Partial<SiteSettingsFormValues> = {}): SiteSettingsFormValues {
  return { ...emptyFormValues(), ...over };
}

function issues(v: SiteSettingsFormValues): string[] {
  const r = siteSettingsFormSchema.safeParse(v);
  return r.success ? [] : r.error.issues.map((i) => i.message);
}

describe("siteSettingsFormSchema", () => {
  it("form rỗng hoàn toàn là hợp lệ", () => {
    expect(siteSettingsFormSchema.safeParse(emptyFormValues()).success).toBe(true);
  });

  it("dữ liệu đầy đủ hợp lệ", () => {
    const v = values({
      name: "Viễn Chí Bảo",
      taxId: "0107994675",
      phone: "086.836.6662",
      email: "vienchibao6868@gmail.com",
    });
    v.socials.zalo = "https://zalo.me/0945366662";
    v.offices.headquarters = { street: "39 Cầu Diễn", city: "Hà Nội" };
    expect(issues(v)).toEqual([]);
  });

  it.each(["12345", "abc", "1234567890123456"])("từ chối điện thoại %s", (phone) => {
    expect(issues(values({ phone }))).toContain("Số điện thoại không hợp lệ");
  });

  it.each(["086.836.6662", "+84 868 366 662", "(024) 3825 1234"])("nhận điện thoại %s", (phone) => {
    expect(issues(values({ phone }))).toEqual([]);
  });

  it("từ chối email sai", () => {
    expect(issues(values({ email: "sai" }))).toContain("Email không hợp lệ");
  });

  it.each(["http://zalo.me/1", "javascript:alert(1)", "zalo.me/1", "https://"])(
    "từ chối link %s",
    (zalo) => {
      const v = values();
      v.socials.zalo = zalo;
      expect(issues(v)).toContain("Liên kết Zalo phải bắt đầu bằng https://");
    },
  );

  it("từ chối giá trị quá dài", () => {
    expect(issues(values({ name: "a".repeat(121) }))).toContain("Tên công ty tối đa 120 ký tự");
  });

  it("ô chỉ có khoảng trắng coi như trống và hợp lệ", () => {
    const v = values({ phone: "   ", email: "  " });
    v.socials.zalo = "   ";
    expect(issues(v)).toEqual([]);
  });
});

describe("fromSettings / toPayload", () => {
  it("null thì ra form rỗng", () => {
    expect(fromSettings(null)).toEqual(emptyFormValues());
  });

  it("điền các ô từ dữ liệu, thiếu thì để chuỗi rỗng", () => {
    const v = fromSettings({
      name: "Viễn Chí Bảo",
      socials: { zalo: "https://zalo.me/1" },
      offices: { showroom: { street: "39 Xã Đàn" } },
    });
    expect(v.name).toBe("Viễn Chí Bảo");
    expect(v.taxId).toBe("");
    expect(v.socials.zalo).toBe("https://zalo.me/1");
    expect(v.socials.threads).toBe("");
    expect(v.offices.showroom).toEqual({ street: "39 Xã Đàn", city: "" });
    expect(v.offices.headquarters).toEqual({ street: "", city: "" });
  });

  it("toPayload cắt khoảng trắng mọi ô", () => {
    const v = values({ name: "  Viễn Chí Bảo  " });
    v.socials.zalo = " https://zalo.me/1 ";
    v.offices.headquarters = { street: " 39 Cầu Diễn ", city: " Hà Nội " };
    const p = toPayload(v);
    expect(p.name).toBe("Viễn Chí Bảo");
    expect(p.socials.zalo).toBe("https://zalo.me/1");
    expect(p.offices.headquarters).toEqual({ street: "39 Cầu Diễn", city: "Hà Nội" });
  });
});
