import { describe, expect, it } from "vitest";
import { applySessionCookies, clearSessionCookies } from "./session-cookies";

type Call = { name: string; value: string; options: Record<string, unknown> };

function fakeJar() {
  const calls: Call[] = [];
  return {
    calls,
    jar: {
      set(name: string, value: string, options: Record<string, unknown>) {
        calls.push({ name, value, options });
      },
    },
    byName(name: string) {
      return calls.find((c) => c.name === name);
    },
  };
}

describe("applySessionCookies", () => {
  it("ghi admin_token (24 giờ, path /) và admin_rt (path /api/admin, maxAge theo backend)", () => {
    const f = fakeJar();
    applySessionCookies(f.jar, {
      accessToken: "ACC",
      refreshToken: "REF",
      refreshMaxAge: 604800,
    });
    expect(f.byName("admin_token")).toMatchObject({
      value: "ACC",
      options: { httpOnly: true, sameSite: "lax", path: "/", maxAge: 86400 },
    });
    expect(f.byName("admin_rt")).toMatchObject({
      value: "REF",
      options: { httpOnly: true, sameSite: "lax", path: "/api/admin", maxAge: 604800 },
    });
    expect(f.byName("admin_just_refreshed")).toBeUndefined();
  });

  it("refreshMaxAge null thì admin_rt là cookie phiên (không có maxAge)", () => {
    const f = fakeJar();
    applySessionCookies(f.jar, { accessToken: "A", refreshToken: "R", refreshMaxAge: null });
    expect(f.byName("admin_rt")?.options).not.toHaveProperty("maxAge");
  });

  it("refreshToken null thì không ghi admin_rt", () => {
    const f = fakeJar();
    applySessionCookies(f.jar, { accessToken: "A", refreshToken: null, refreshMaxAge: null });
    expect(f.byName("admin_token")).toBeDefined();
    expect(f.byName("admin_rt")).toBeUndefined();
  });

  it("markRefreshed ghi cookie dấu 10 giây, path /admin, httpOnly", () => {
    const f = fakeJar();
    applySessionCookies(
      f.jar,
      { accessToken: "A", refreshToken: "R", refreshMaxAge: 5 },
      { markRefreshed: true },
    );
    expect(f.byName("admin_just_refreshed")).toMatchObject({
      value: "1",
      options: { httpOnly: true, sameSite: "lax", path: "/admin", maxAge: 10 },
    });
  });
});

describe("clearSessionCookies", () => {
  it("xóa cả ba cookie với đúng path đã dùng khi ghi", () => {
    const f = fakeJar();
    clearSessionCookies(f.jar);
    expect(f.byName("admin_token")).toMatchObject({
      value: "",
      options: { path: "/", maxAge: 0 },
    });
    expect(f.byName("admin_rt")).toMatchObject({
      value: "",
      options: { path: "/api/admin", maxAge: 0 },
    });
    expect(f.byName("admin_just_refreshed")).toMatchObject({
      value: "",
      options: { path: "/admin", maxAge: 0 },
    });
  });
});
