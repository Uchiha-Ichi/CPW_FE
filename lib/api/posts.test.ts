import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getPostBySlug, getPosts, listAllPosts } from "./posts";

const json = (body: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

const item = (slug: string) => ({
  _id: slug,
  slug,
  category: "news",
  title: `T ${slug}`,
  availableLangs: ["vi"],
});

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("getPosts", () => {
  it("dựng query đúng và trả danh sách", async () => {
    const body = { items: [item("a")], total: 1, page: 2, limit: 10, totalPages: 3 };
    const fetchMock = vi.fn().mockResolvedValue(json(body));
    vi.stubGlobal("fetch", fetchMock);
    const result = await getPosts({ lang: "en", page: 2, limit: 10, category: "news" });
    expect(result).toEqual({ status: "ok", data: body });
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("/posts?");
    expect(url).toContain("lang=en");
    expect(url).toContain("page=2");
    expect(url).toContain("limit=10");
    expect(url).toContain("category=news");
  });

  it("JSON không có mảng items thì error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({ items: "oops" })));
    expect(await getPosts({ lang: "vi" })).toEqual({ status: "error" });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json(null)));
    expect(await getPosts({ lang: "vi" })).toEqual({ status: "error" });
  });

  it("API lỗi thì error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({}, 500)));
    expect(await getPosts({ lang: "vi" })).toEqual({ status: "error" });
  });
});

describe("getPostBySlug", () => {
  it("encode slug và gửi lang", async () => {
    const fetchMock = vi.fn().mockResolvedValue(json({ ...item("a b"), status: "published" }));
    vi.stubGlobal("fetch", fetchMock);
    await getPostBySlug("a b", "vi");
    expect(fetchMock.mock.calls[0][0]).toContain("/posts/a%20b?lang=vi");
  });

  it("bài chưa có bản tiếng Anh (API 404) thì not-found", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({ message: "x" }, 404)));
    expect(await getPostBySlug("a", "en")).toEqual({ status: "not-found" });
  });

  it("JSON hỏng (không phải object) thì error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json(null)));
    expect(await getPostBySlug("a", "vi")).toEqual({ status: "error" });
  });
});

describe("listAllPosts", () => {
  it("duyệt hết các trang", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(json({ items: [item("a")], total: 2, page: 1, limit: 100, totalPages: 2 }))
      .mockResolvedValueOnce(json({ items: [item("b")], total: 2, page: 2, limit: 100, totalPages: 2 }));
    vi.stubGlobal("fetch", fetchMock);
    const all = await listAllPosts();
    expect(all.map((p) => p.slug)).toEqual(["a", "b"]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toContain("page=2");
  });

  it("gặp lỗi thì dừng và trả phần đã gom (không ném lỗi)", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(json({ items: [item("a")], total: 2, page: 1, limit: 100, totalPages: 2 }))
      .mockResolvedValueOnce(json({}, 500));
    vi.stubGlobal("fetch", fetchMock);
    expect((await listAllPosts()).map((p) => p.slug)).toEqual(["a"]);
  });

  it("API chết ngay từ đầu thì trả mảng rỗng", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    expect(await listAllPosts()).toEqual([]);
  });
});
