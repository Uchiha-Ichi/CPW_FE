import { afterEach, describe, expect, it, vi } from "vitest";
import { getAdminAccess } from "./session";

const res = (body: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("getAdminAccess", () => {
  it("gọi /auth/profile với Bearer token và không cache", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(res({ role: "admin", isActive: true }));
    vi.stubGlobal("fetch", fetchMock);
    await getAdminAccess("tok123");
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/auth/profile");
    expect(init.headers).toEqual({ Authorization: "Bearer tok123" });
    expect(init.cache).toBe("no-store");
  });

  it("truyền AbortSignal để không treo khi backend không phản hồi", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(res({ role: "admin", isActive: true }));
    vi.stubGlobal("fetch", fetchMock);
    await getAdminAccess("t");
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("fetch bị abort do quá thời gian là unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new DOMException("timeout", "TimeoutError"))
    );
    expect(await getAdminAccess("t")).toEqual({ status: "unavailable" });
  });

  it("role admin đang hoạt động thì được vào", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(res({ role: "admin", isActive: true }))
    );
    expect(await getAdminAccess("t")).toEqual({ status: "admin" });
  });

  it("thiếu isActive vẫn được vào nếu role admin", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(res({ role: "admin" })));
    expect(await getAdminAccess("t")).toEqual({ status: "admin" });
  });

  it("role staff bị từ chối (forbidden)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(res({ role: "staff", isActive: true }))
    );
    expect(await getAdminAccess("t")).toEqual({ status: "forbidden" });
  });

  it("admin nhưng isActive false bị từ chối", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(res({ role: "admin", isActive: false }))
    );
    expect(await getAdminAccess("t")).toEqual({ status: "forbidden" });
  });

  it("401 là unauthenticated", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(res({}, 401)));
    expect(await getAdminAccess("t")).toEqual({ status: "unauthenticated" });
  });

  it("403 là forbidden", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(res({}, 403)));
    expect(await getAdminAccess("t")).toEqual({ status: "forbidden" });
  });

  it("status lỗi khác là unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(res({}, 500)));
    expect(await getAdminAccess("t")).toEqual({ status: "unavailable" });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(res({}, 404)));
    expect(await getAdminAccess("t")).toEqual({ status: "unavailable" });
  });

  it("lỗi mạng là unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    expect(await getAdminAccess("t")).toEqual({ status: "unavailable" });
  });

  it("JSON hỏng là unavailable", async () => {
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
    expect(await getAdminAccess("t")).toEqual({ status: "unavailable" });
  });

  it("thân phản hồi không có role hợp lệ là unavailable, không bao giờ là admin", async () => {
    for (const body of [
      null,
      "admin",
      42,
      [],
      {},
      { role: 1 },
      { role: null },
    ]) {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(res(body)));
      expect(await getAdminAccess("t")).toEqual({ status: "unavailable" });
    }
  });
});
