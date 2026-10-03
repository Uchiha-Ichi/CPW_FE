import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getSiteSettings } from "./site-settings";

const json = (body: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("getSiteSettings", () => {
  it("trả cài đặt đã chuẩn hóa khi API ok", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        json({ name: "Viễn Chí Bảo", socials: { zalo: "https://zalo.me/1" } })
      );
    vi.stubGlobal("fetch", fetchMock);
    expect(await getSiteSettings()).toEqual({
      name: "Viễn Chí Bảo",
      socials: { zalo: "https://zalo.me/1" },
      offices: {},
    });
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      "/site-settings/public"
    );
  });

  it("404, 500, mạng lỗi hoặc dữ liệu không phải object thì trả null", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({}, 404)));
    expect(await getSiteSettings()).toBeNull();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({}, 500)));
    expect(await getSiteSettings()).toBeNull();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    expect(await getSiteSettings()).toBeNull();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json([1, 2])));
    expect(await getSiteSettings()).toBeNull();
  });
});
