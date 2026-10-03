import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "./post-errors";
import { emptyFormValues } from "./site-settings-form";
import { getAdminSiteSettings, saveAdminSiteSettings } from "./site-settings-api";

const response = (body: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  text: async () => (body === undefined ? "" : JSON.stringify(body)),
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getAdminSiteSettings", () => {
  it("gọi GET /site-settings/public qua proxy và chuẩn hóa dữ liệu", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({ name: " Viễn Chí Bảo ", socials: { zalo: "javascript:x" } }));
    vi.stubGlobal("fetch", fetchMock);
    const s = await getAdminSiteSettings();
    expect(fetchMock.mock.calls[0][0]).toBe("/api/admin/proxy/site-settings/public");
    expect(s).toEqual({ name: "Viễn Chí Bảo", socials: {}, offices: {} });
  });

  it("dữ liệu không phải object thì trả cài đặt rỗng", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response([])));
    expect(await getAdminSiteSettings()).toEqual({ socials: {}, offices: {} });
  });

  it("lỗi HTTP thì ném ApiError có thông báo tiếng Việt", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({}, 500)));
    await expect(getAdminSiteSettings()).rejects.toBeInstanceOf(ApiError);
  });
});

describe("saveAdminSiteSettings", () => {
  it("gửi PATCH /site-settings với JSON đã cắt khoảng trắng", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({ name: "Viễn Chí Bảo", socials: {}, offices: {} }));
    vi.stubGlobal("fetch", fetchMock);
    const form = emptyFormValues();
    form.name = "  Viễn Chí Bảo ";
    const saved = await saveAdminSiteSettings(form);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/admin/proxy/site-settings");
    expect(init.method).toBe("PATCH");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(init.body).name).toBe("Viễn Chí Bảo");
    expect(saved.name).toBe("Viễn Chí Bảo");
  });

  it("400 từ backend: ném ApiError mang thông báo của server", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(response({ message: ["Email không hợp lệ"] }, 400)),
    );
    await expect(saveAdminSiteSettings(emptyFormValues())).rejects.toMatchObject({
      status: 400,
      messages: ["Email không hợp lệ"],
    });
  });

  it("mất mạng: ApiError status 0", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    await expect(saveAdminSiteSettings(emptyFormValues())).rejects.toMatchObject({ status: 0 });
  });
});
