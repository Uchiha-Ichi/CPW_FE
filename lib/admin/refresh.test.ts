import { afterEach, describe, expect, it, vi } from "vitest";
import { refreshSession } from "./refresh";

const okRes = (cookies: string[]) => ({
  ok: true,
  status: 200,
  headers: { getSetCookie: () => cookies },
});
const failRes = (status = 401) => ({
  ok: false,
  status,
  headers: { getSetCookie: () => [] as string[] },
});
const goodCookies = [
  "crmspd_at=NEWACCESS; Max-Age=900; Path=/; HttpOnly",
  "crmspd_rt=NEWREFRESH; Max-Age=604800; Path=/api/auth; HttpOnly",
  "crmspd_csrf=zzz; Path=/",
];

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("refreshSession", () => {
  it("thành công: gọi POST /auth/refresh với refreshToken trong body và trả token mới", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okRes(goodCookies));
    vi.stubGlobal("fetch", fetchMock);
    const result = await refreshSession("t-success");
    expect(result).toEqual({
      accessToken: "NEWACCESS",
      refreshToken: "NEWREFRESH",
      refreshMaxAge: 604800,
    });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/auth/refresh");
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(init.body as string)).toEqual({ refreshToken: "t-success" });
    expect(init.cache).toBe("no-store");
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("thiếu crmspd_at hoặc crmspd_rt trong Set-Cookie thì null", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okRes(["crmspd_at=A; Max-Age=1"])));
    expect(await refreshSession("t-missing-rt")).toBeNull();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okRes(["crmspd_rt=R; Max-Age=1"])));
    expect(await refreshSession("t-missing-at")).toBeNull();
  });

  it("backend trả lỗi hoặc mạng lỗi thì null", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(failRes(401)));
    expect(await refreshSession("t-401")).toBeNull();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    expect(await refreshSession("t-down")).toBeNull();
  });

  it("nhiều lần gọi đồng thời cùng token chỉ gọi backend một lần", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okRes(goodCookies));
    vi.stubGlobal("fetch", fetchMock);
    const [a, b, c] = await Promise.all([
      refreshSession("t-concurrent"),
      refreshSession("t-concurrent"),
      refreshSession("t-concurrent"),
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(a).toEqual(b);
    expect(b).toEqual(c);
    expect(a?.accessToken).toBe("NEWACCESS");
  });

  it("token khác nhau thì gọi riêng", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okRes(goodCookies));
    vi.stubGlobal("fetch", fetchMock);
    await Promise.all([refreshSession("t-diff-1"), refreshSession("t-diff-2")]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("kết quả thành công được dùng lại trong 10 giây, quá hạn thì gọi lại", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okRes(goodCookies));
    vi.stubGlobal("fetch", fetchMock);
    const nowSpy = vi.spyOn(Date, "now");
    nowSpy.mockReturnValue(1_000);
    await refreshSession("t-reuse");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    nowSpy.mockReturnValue(1_000 + 5_000);
    const reused = await refreshSession("t-reuse");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(reused?.accessToken).toBe("NEWACCESS");

    nowSpy.mockReturnValue(1_000 + 10_001);
    await refreshSession("t-reuse");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("thất bại không được giữ lại: lần sau gọi lại backend", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(failRes(401))
      .mockResolvedValueOnce(okRes(goodCookies));
    vi.stubGlobal("fetch", fetchMock);
    expect(await refreshSession("t-retry")).toBeNull();
    const second = await refreshSession("t-retry");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(second?.accessToken).toBe("NEWACCESS");
  });
});
