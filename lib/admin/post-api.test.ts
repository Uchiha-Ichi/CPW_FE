import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createPost,
  deletePost,
  getAdminPost,
  listAdminPosts,
  publishPost,
  unpublishPost,
  updatePost,
  uploadPostImage,
} from "./post-api";
import { ApiError } from "./post-errors";
import type { PostPayload } from "./post-types";

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

const payload: PostPayload = {
  category: "news",
  vi: { title: "T", excerpt: "", content: "<p>x</p>" },
};

describe("post-api", () => {
  it("listAdminPosts gọi đúng địa chỉ có phân trang", async () => {
    const fn = mockFetch(200, { items: [], total: 0, page: 2, limit: 20, totalPages: 0 });
    await listAdminPosts(2, 20);
    expect(fn.mock.calls[0][0]).toBe("/api/admin/proxy/posts/admin?page=2&limit=20");
  });

  it("getAdminPost mã hóa id", async () => {
    const fn = mockFetch(200, { _id: "a b" });
    await getAdminPost("a b");
    expect(fn.mock.calls[0][0]).toBe("/api/admin/proxy/posts/admin/a%20b");
  });

  it("createPost gửi POST với JSON", async () => {
    const fn = mockFetch(201, { _id: "1", slug: "t" });
    const result = await createPost(payload);
    const [url, init] = fn.mock.calls[0];
    expect(url).toBe("/api/admin/proxy/posts");
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(init.body as string)).toEqual(payload);
    expect(result).toMatchObject({ slug: "t" });
  });

  it("updatePost gửi PATCH; publish/unpublish gọi đúng đường dẫn", async () => {
    const fn = mockFetch(200, {});
    await updatePost("1", payload);
    expect(fn.mock.calls[0][0]).toBe("/api/admin/proxy/posts/1");
    expect(fn.mock.calls[0][1].method).toBe("PATCH");

    const fn2 = mockFetch(200, {});
    await publishPost("1");
    expect(fn2.mock.calls[0][0]).toBe("/api/admin/proxy/posts/1/publish");
    expect(fn2.mock.calls[0][1].method).toBe("PATCH");

    const fn3 = mockFetch(200, {});
    await unpublishPost("1");
    expect(fn3.mock.calls[0][0]).toBe("/api/admin/proxy/posts/1/unpublish");
  });

  it("deletePost chấp nhận phản hồi rỗng (không có body)", async () => {
    const fn = mockFetch(200);
    await expect(deletePost("1")).resolves.toBeNull();
    expect(fn.mock.calls[0][1].method).toBe("DELETE");
  });

  it("lỗi 401 thành ApiError phiên hết hạn", async () => {
    mockFetch(401, { message: "Unauthorized" });
    const error = await getAdminPost("1").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(401);
    expect((error as ApiError).messages).toEqual(["Phiên đăng nhập đã hết hạn."]);
  });

  it("lỗi 400 lấy thông điệp tiếng Việt của server", async () => {
    mockFetch(400, { message: ["cover.Thiếu đường dẫn ảnh bìa"] });
    const error = await createPost(payload).catch((e: unknown) => e);
    expect((error as ApiError).messages).toEqual(["Thiếu đường dẫn ảnh bìa"]);
  });

  it("mất mạng thành ApiError trạng thái 0", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    const error = await listAdminPosts().catch((e: unknown) => e);
    expect((error as ApiError).status).toBe(0);
    expect((error as ApiError).messages[0]).toContain("Không kết nối được máy chủ");
  });
});

describe("uploadPostImage", () => {
  const png = () => new File([new Uint8Array(10)], "a.png", { type: "image/png" });

  it("tải lên /uploads?folder=posts với trường file", async () => {
    const fn = mockFetch(201, { url: "https://res.cloudinary.com/x/a.png", publicId: "vcb/posts/a" });
    const result = await uploadPostImage(png());
    const [url, init] = fn.mock.calls[0];
    expect(url).toBe("/api/admin/proxy/uploads?folder=posts");
    expect(init.method).toBe("POST");
    expect(init.body).toBeInstanceOf(FormData);
    expect((init.body as FormData).get("file")).toBeInstanceOf(File);
    expect(result.publicId).toBe("vcb/posts/a");
  });

  it("từ chối tệp không phải ảnh mà không gọi mạng", async () => {
    const fn = mockFetch(201, {});
    const pdf = new File(["x"], "a.pdf", { type: "application/pdf" });
    const error = await uploadPostImage(pdf).catch((e: unknown) => e);
    expect((error as ApiError).messages[0]).toContain("Chỉ nhận tệp ảnh");
    expect(fn).not.toHaveBeenCalled();
  });

  it("từ chối ảnh quá 10MB mà không gọi mạng", async () => {
    const fn = mockFetch(201, {});
    const big = new File([new Uint8Array(10 * 1024 * 1024 + 1)], "big.png", { type: "image/png" });
    const error = await uploadPostImage(big).catch((e: unknown) => e);
    expect((error as ApiError).messages[0]).toContain("tối đa 10MB");
    expect(fn).not.toHaveBeenCalled();
  });
});
