import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getNetwork } from "./network";

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

describe("getNetwork", () => {
  it("trả mảng quốc gia thô (toPins lọc sau)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json([{ code: "vn" }, null])));
    expect(await getNetwork()).toEqual({ status: "ok", data: [{ code: "vn" }, null] });
  });
  it("404 thì ok rỗng; lỗi hoặc không phải mảng thì error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({}, 404)));
    expect(await getNetwork()).toEqual({ status: "ok", data: [] });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({ a: 1 })));
    expect(await getNetwork()).toEqual({ status: "error" });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({}, 500)));
    expect(await getNetwork()).toEqual({ status: "error" });
  });
});
