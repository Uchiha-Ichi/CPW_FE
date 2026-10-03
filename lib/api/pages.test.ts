import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getPublicPage } from "./pages";

const json = (body: unknown, ok = true, status = 200) => ({
  ok,
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

describe("getPublicPage", () => {
  it("trả block hợp lệ và gọi đúng URL kèm lang", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      json({ pageKey: "home", blocks: [{ id: "a", type: "hero", data: { title: "X" } }] }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await getPublicPage("home", "en");

    expect(result).toEqual({
      status: "ok",
      data: { pageKey: "home", blocks: [{ id: "a", type: "hero", data: { title: "X" } }] },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/pages/public/home?lang=en"),
      expect.anything(),
    );
  });

  it("lọc bỏ phần tử block hỏng", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        json({
          blocks: [
            { id: "a", type: "cta", data: {} },
            null,
            "x",
            { id: 1, type: "cta", data: {} },
            { id: "b", type: "cta" },
            { id: "c", type: "cta", data: [] },
          ],
        }),
      ),
    );
    const result = await getPublicPage("home", "vi");
    expect(result.status === "ok" && result.data.blocks.map((b) => b.id)).toEqual(["a"]);
  });

  it("API trả 404 thì coi là trang chưa có nội dung (ok, blocks rỗng)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({}, false, 404)));
    expect(await getPublicPage("about", "vi")).toEqual({
      status: "ok",
      data: { pageKey: "about", blocks: [] },
    });
  });

  it("API trả lỗi 500 hoặc mạng lỗi thì trả error (khác với trang trống)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({}, false, 500)));
    expect(await getPublicPage("home", "vi")).toEqual({ status: "error" });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    expect(await getPublicPage("about", "vi")).toEqual({ status: "error" });
  });

  it("JSON không có mảng blocks thì blocks rỗng", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({ blocks: "oops" })));
    expect(await getPublicPage("home", "vi")).toEqual({
      status: "ok",
      data: { pageKey: "home", blocks: [] },
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json(null)));
    expect(await getPublicPage("home", "vi")).toEqual({
      status: "ok",
      data: { pageKey: "home", blocks: [] },
    });
  });
});
