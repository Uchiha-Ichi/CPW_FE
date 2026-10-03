import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/admin/post-errors";
import {
  discardDraft,
  getAdminPage,
  getBlockTypes,
  publishPage,
  saveDraft,
  uploadPageImage,
} from "./api";
import type { EditorBlock } from "./types";

afterEach(() => {
  vi.unstubAllGlobals();
});

function mockFetch(status: number, body?: unknown) {
  const fn = vi.fn().mockResolvedValue(
    new Response(body === undefined ? null : JSON.stringify(body), { status }),
  );
  vi.stubGlobal("fetch", fn);
  return fn;
}

const blocks: EditorBlock[] = [
  { id: "b1", type: "hero", data: { title: { vi: "Xin chào" } } },
];

describe("page-editor api", () => {
  it("getBlockTypes gọi đúng địa chỉ", async () => {
    const fn = mockFetch(200, { blockTypes: [], pages: [], maxBlocksPerPage: 20 });
    await getBlockTypes();
    expect(fn.mock.calls[0][0]).toBe("/api/admin/proxy/pages/block-types");
  });

  it("getAdminPage mã hóa pageKey", async () => {
    const fn = mockFetch(200, { pageKey: "home" });
    await getAdminPage("a b");
    expect(fn.mock.calls[0][0]).toBe("/api/admin/proxy/pages/a%20b");
  });

  it("saveDraft gửi PUT với baseVersion và blocks", async () => {
    const fn = mockFetch(200, { pageKey: "home", version: 4 });
    const view = await saveDraft("home", 3, blocks);
    const [url, init] = fn.mock.calls[0];
    expect(url).toBe("/api/admin/proxy/pages/home/draft");
    expect(init.method).toBe("PUT");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(init.body as string)).toEqual({ baseVersion: 3, blocks });
    expect(view.version).toBe(4);
  });

  it("publishPage và discardDraft gửi POST với baseVersion", async () => {
    const fn = mockFetch(200, {});
    await publishPage("about", 5);
    expect(fn.mock.calls[0][0]).toBe("/api/admin/proxy/pages/about/publish");
    expect(fn.mock.calls[0][1].method).toBe("POST");
    expect(JSON.parse(fn.mock.calls[0][1].body as string)).toEqual({ baseVersion: 5 });

    const fn2 = mockFetch(200, {});
    await discardDraft("about", 6);
    expect(fn2.mock.calls[0][0]).toBe("/api/admin/proxy/pages/about/discard");
    expect(JSON.parse(fn2.mock.calls[0][1].body as string)).toEqual({ baseVersion: 6 });
  });

  it("409 thành ApiError mang câu của server", async () => {
    mockFetch(409, { message: "Trang vừa được cập nhật ở nơi khác. Hãy tải lại rồi sửa tiếp." });
    const error = await saveDraft("home", 1, blocks).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(409);
    expect((error as ApiError).messages[0]).toContain("Trang vừa được cập nhật ở nơi khác");
  });

  it("400 giữ đủ mọi dòng lỗi của server", async () => {
    const message = ['Khối 1 (Đầu trang): "Tiêu đề" là bắt buộc', "Khối 2 (Banner): lỗi khác"];
    mockFetch(400, { message });
    const error = await saveDraft("home", 1, blocks).catch((e: unknown) => e);
    expect((error as ApiError).messages).toEqual(message);
  });

  it("mất mạng thành ApiError trạng thái 0", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    const error = await getAdminPage("home").catch((e: unknown) => e);
    expect((error as ApiError).status).toBe(0);
    expect((error as ApiError).messages[0]).toContain("Không kết nối được máy chủ");
  });
});

describe("uploadPageImage", () => {
  const png = () => new File([new Uint8Array(10)], "a.png", { type: "image/png" });

  it("tải lên /uploads?folder=pages với trường file", async () => {
    const fn = mockFetch(201, {
      url: "https://res.cloudinary.com/x/image/upload/vcb/pages/a.png",
      publicId: "vcb/pages/a",
    });
    const result = await uploadPageImage(png());
    const [url, init] = fn.mock.calls[0];
    expect(url).toBe("/api/admin/proxy/uploads?folder=pages");
    expect(init.method).toBe("POST");
    expect((init.body as FormData).get("file")).toBeInstanceOf(File);
    expect(result.publicId).toBe("vcb/pages/a");
  });

  it("từ chối tệp không phải ảnh mà không gọi mạng", async () => {
    const fn = mockFetch(201, {});
    const pdf = new File(["x"], "a.pdf", { type: "application/pdf" });
    const error = await uploadPageImage(pdf).catch((e: unknown) => e);
    expect((error as ApiError).messages[0]).toContain("Chỉ nhận tệp ảnh");
    expect(fn).not.toHaveBeenCalled();
  });

  it("từ chối ảnh quá 10MB mà không gọi mạng", async () => {
    const fn = mockFetch(201, {});
    const big = new File([new Uint8Array(10 * 1024 * 1024 + 1)], "big.png", { type: "image/png" });
    const error = await uploadPageImage(big).catch((e: unknown) => e);
    expect((error as ApiError).messages[0]).toContain("tối đa 10MB");
    expect(fn).not.toHaveBeenCalled();
  });
});
