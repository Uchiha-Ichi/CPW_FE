import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getJobBySlug, getJobs } from "./jobs";

const json = (body: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

const job = (slug: string) => ({
  slug,
  title: `Job ${slug}`,
  department: "Công nghệ",
  location: "Hà Nội",
  type: "Toàn thời gian",
  status: "Đang tuyển",
});

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("getJobs", () => {
  it("trả danh sách và bỏ phần tử thiếu field bắt buộc", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(json([job("a"), null, { slug: "b" }, job("c")])),
    );
    const result = await getJobs();
    expect(result.status === "ok" && result.data.map((j) => j.slug)).toEqual(["a", "c"]);
  });

  it("API 404 thì coi là chưa có việc làm (ok, rỗng)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({}, 404)));
    expect(await getJobs()).toEqual({ status: "ok", data: [] });
  });

  it("API lỗi hoặc JSON không phải mảng thì error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({}, 500)));
    expect(await getJobs()).toEqual({ status: "error" });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({ a: 1 })));
    expect(await getJobs()).toEqual({ status: "error" });
  });
});

describe("getJobBySlug", () => {
  it("trả việc làm và encode slug", async () => {
    const fetchMock = vi.fn().mockResolvedValue(json(job("a b")));
    vi.stubGlobal("fetch", fetchMock);
    const result = await getJobBySlug("a b");
    expect(result.status).toBe("ok");
    expect(fetchMock.mock.calls[0][0]).toContain("/jobs/public/a%20b");
  });

  it("việc đã đóng hoặc không có (API 404) thì not-found", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({}, 404)));
    expect(await getJobBySlug("x")).toEqual({ status: "not-found" });
  });

  it("dữ liệu hỏng thì error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json({ title: 1 })));
    expect(await getJobBySlug("x")).toEqual({ status: "error" });
  });
});
