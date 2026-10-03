import { describe, expect, it } from "vitest";
import { emptySiteSettings, parseSiteSettings } from "./settings-model";

describe("parseSiteSettings", () => {
  it.each([null, undefined, "x", 5, []])(
    "%j không phải object thì trả null",
    (raw) => {
      expect(parseSiteSettings(raw)).toBeNull();
    }
  );

  it("object rỗng thì trả cài đặt rỗng", () => {
    expect(parseSiteSettings({})).toEqual(emptySiteSettings());
    expect(emptySiteSettings()).toEqual({ socials: {}, offices: {} });
  });

  it("cắt khoảng trắng, bỏ chuỗi rỗng và giá trị không phải chuỗi", () => {
    expect(
      parseSiteSettings({
        name: "  Viễn Chí Bảo ",
        taxId: "  ",
        phone: 5,
        email: null,
      })
    ).toEqual({ name: "Viễn Chí Bảo", socials: {}, offices: {} });
  });

  it("chỉ giữ link https; bỏ javascript:, http:// và https:// trơ trọi", () => {
    const s = parseSiteSettings({
      socials: {
        zalo: "https://zalo.me/1",
        tiktok: "javascript:alert(1)",
        facebook: "http://facebook.com/x",
        youtube: "https://",
        instagram: "https://a b",
        threads: " https://threads.net/@x ",
        myspace: "https://myspace.com",
      },
    });
    expect(s?.socials).toEqual({
      zalo: "https://zalo.me/1",
      threads: "https://threads.net/@x",
    });
  });

  it("giữ cơ sở chỉ có city hoặc chỉ có street; bỏ cơ sở rỗng", () => {
    const s = parseSiteSettings({
      offices: {
        headquarters: { city: "Hà Nội" },
        showroom: { street: "39 Xã Đàn" },
        warehouse: { street: "x" },
      },
    });
    expect(s?.offices).toEqual({
      headquarters: { city: "Hà Nội" },
      showroom: { street: "39 Xã Đàn" },
    });
    expect(
      parseSiteSettings({ offices: { headquarters: { street: " " } } })?.offices
    ).toEqual({});
  });

  it("socials / offices sai kiểu thì coi như rỗng, không ném lỗi", () => {
    expect(parseSiteSettings({ socials: "x", offices: [1] })).toEqual(
      emptySiteSettings()
    );
  });
});
