import { describe, expect, it } from "vitest";
import { visibleSocials } from "./socials";

describe("visibleSocials", () => {
  it("null hoặc không có link thì trả mảng rỗng", () => {
    expect(visibleSocials(null)).toEqual([]);
    expect(visibleSocials({ socials: {}, offices: {} })).toEqual([]);
  });

  it("chỉ trả mạng có link, theo thứ tự cố định zalo, tiktok, facebook, youtube, instagram, threads", () => {
    const items = visibleSocials({
      socials: {
        threads: "https://threads.net/@x",
        zalo: "https://zalo.me/1",
        instagram: "https://instagram.com/x",
      },
      offices: {},
    });
    expect(items.map((i) => i.key)).toEqual(["zalo", "instagram", "threads"]);
    expect(items[0]).toEqual({
      key: "zalo",
      label: "Zalo",
      url: "https://zalo.me/1",
    });
  });
});
