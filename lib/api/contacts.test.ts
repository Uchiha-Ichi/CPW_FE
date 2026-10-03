import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createContact } from "./contacts";

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const input = { name: "A", email: "a@b.co", message: "Xin chào" };

describe("createContact", () => {
  it("POST JSON tới /contacts, không cache, thành công trả ok", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 201 });
    vi.stubGlobal("fetch", fetchMock);
    expect(await createContact(input)).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("/contacts");
    expect(init).toMatchObject({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      cache: "no-store",
    });
  });

  it("API trả 400 thì ok:false", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 400 }));
    expect(await createContact(input)).toEqual({ ok: false });
  });

  it("mạng lỗi thì ok:false, không ném lỗi", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")));
    expect(await createContact(input)).toEqual({ ok: false });
  });
});
