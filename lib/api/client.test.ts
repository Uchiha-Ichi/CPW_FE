import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiGet } from "./client";

const res = (body: unknown, status = 200) => ({
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

describe("apiGet", () => {
  it("200 trả ok kèm dữ liệu, gọi đúng URL, revalidate mặc định 60 giây", async () => {
    const fetchMock = vi.fn().mockResolvedValue(res({ a: 1 }));
    vi.stubGlobal("fetch", fetchMock);
    expect(await apiGet("/x?y=1")).toEqual({ status: "ok", data: { a: 1 } });
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/x?y=1"), {
      next: { revalidate: 60 },
    });
  });

  it("revalidate tùy chỉnh", async () => {
    const fetchMock = vi.fn().mockResolvedValue(res({}));
    vi.stubGlobal("fetch", fetchMock);
    await apiGet("/x", { revalidate: 5 });
    expect(fetchMock).toHaveBeenCalledWith(expect.anything(), {
      next: { revalidate: 5 },
    });
  });

  it("tags được truyền vào next.tags cùng revalidate", async () => {
    const fetchMock = vi.fn().mockResolvedValue(res({}));
    vi.stubGlobal("fetch", fetchMock);
    await apiGet("/x", { tags: ["jobs"] });
    expect(fetchMock).toHaveBeenCalledWith(expect.anything(), {
      next: { revalidate: 60, tags: ["jobs"] },
    });
  });

  it("không truyền tags thì next không có khóa tags", async () => {
    const fetchMock = vi.fn().mockResolvedValue(res({}));
    vi.stubGlobal("fetch", fetchMock);
    await apiGet("/x");
    const init = fetchMock.mock.calls[0][1] as {
      next: Record<string, unknown>;
    };
    expect(Object.keys(init.next)).toEqual(["revalidate"]);
  });

  it("404 trả not-found và không ghi log lỗi", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(res({}, 404)));
    expect(await apiGet("/x")).toEqual({ status: "not-found" });
    expect(console.error).not.toHaveBeenCalled();
  });

  it("status lỗi khác trả error và ghi log", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(res({}, 500)));
    expect(await apiGet("/x")).toEqual({ status: "error" });
    expect(console.error).toHaveBeenCalled();
  });

  it("mạng lỗi trả error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    expect(await apiGet("/x")).toEqual({ status: "error" });
  });

  it("JSON hỏng trả error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => {
          throw new SyntaxError("bad json");
        },
      })
    );
    expect(await apiGet("/x")).toEqual({ status: "error" });
  });
});
