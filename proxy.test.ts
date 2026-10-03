import { register } from "node:module";
import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

// Bản ESM của next-intl/middleware viết `import ... from 'next/server'` (không đuôi .js). Gói `next`
// không có "exports" nên Node ESM không tự tìm ra next/server.js, và vitest để Node nạp thẳng gói
// trong node_modules, nên import lỗi. next-intl 4.14.8 không có bản CJS của middleware.
// Hook dưới đây chỉ đổi đúng chuỗi 'next/server' thành 'next/server.js' khi Node giải import;
// middleware vẫn là code thật của next-intl, proxy.ts vẫn được import nguyên vẹn.
// Chỉ áp dụng khi module đang import nằm trong gói next-intl.
const resolveHook = `export async function resolve(specifier, context, nextResolve) {
  const parent = decodeURIComponent(context.parentURL ?? "").replaceAll("\\\\", "/");
  const fromNextIntl = parent.includes("/next-intl/");
  return nextResolve(fromNextIntl && specifier === "next/server" ? "next/server.js" : specifier, context);
}`;
register(`data:text/javascript,${encodeURIComponent(resolveHook)}`);

// Import sau khi đăng ký hook (import tĩnh bị đưa lên đầu file, chạy trước register).
const { default: proxy, config } = await import("./proxy");

function run(path: string, headers: Record<string, string> = {}) {
  return proxy(new NextRequest(`http://localhost:3000${path}`, { headers }));
}

describe("proxy (next-intl)", () => {
  it("chuyển / sang /vi khi không có Accept-Language", async () => {
    const res = await run("/");
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/vi");
  });

  it("chuyển theo Accept-Language en", async () => {
    const res = await run("/about", { "accept-language": "en-US,en;q=0.9" });
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/en/about");
  });

  it("giữ query khi chuyển", async () => {
    const res = await run("/news?page=2", { "accept-language": "vi" });
    expect(res.headers.get("location")).toBe(
      "http://localhost:3000/vi/news?page=2"
    );
  });

  it("không chuyển khi đã có tiền tố hợp lệ", async () => {
    for (const path of ["/vi", "/en", "/vi/about", "/en/careers/abc"]) {
      const res = await run(path);
      expect(res.headers.get("location"), path).toBeNull();
    }
  });

  it("không đặt cookie ngôn ngữ và không thêm header Link hreflang", async () => {
    const res = await run("/vi/about");
    expect(res.headers.get("set-cookie")).toBeNull();
    expect(res.headers.get("link")).toBeNull();
  });
});

// Giữ phần kiểm matcher của proxy cũ: admin, api, _next, icon, apple-icon và tệp có đuôi không đi qua proxy.
describe("config.matcher", () => {
  const regex = new RegExp(`^${config.matcher[0]}$`);

  it("không áp dụng cho admin, api, _next, tệp tĩnh", () => {
    for (const path of [
      "/admin",
      "/admin/login",
      "/api/admin/login",
      "/_next/static/a.js",
      "/robots.txt",
      "/sitemap.xml",
      "/maps/world.svg",
    ]) {
      expect(regex.test(path), path).toBe(false);
    }
  });

  it("không áp dụng cho /icon và /apple-icon (ảnh do app/icon.tsx, app/apple-icon.tsx sinh, không có đuôi)", () => {
    for (const path of ["/icon", "/apple-icon"]) {
      expect(regex.test(path), path).toBe(false);
    }
  });

  it("áp dụng cho trang public", () => {
    for (const path of ["/", "/about", "/vi", "/vi/news", "/en/careers/abc"]) {
      expect(regex.test(path), path).toBe(true);
    }
  });
});
