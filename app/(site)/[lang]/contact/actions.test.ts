import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/contacts", () => ({ createContact: vi.fn() }));

import { createContact } from "@/lib/api/contacts";
import { submitContact } from "./actions";

const createContactMock = vi.mocked(createContact);

const valid = {
  name: "A",
  email: "a@b.co",
  phone: "",
  company: "ACME",
  topic: "careers",
  job: "Dev",
  message: "Xin chào",
};

beforeEach(() => {
  createContactMock.mockReset();
});

describe("submitContact", () => {
  it("dữ liệu sai thì invalid và không gọi API", async () => {
    expect(await submitContact({ ...valid, email: "x" })).toEqual({ ok: false, reason: "invalid" });
    expect(await submitContact(null)).toEqual({ ok: false, reason: "invalid" });
    expect(createContactMock).not.toHaveBeenCalled();
  });

  it("gửi đúng payload cho backend: gộp chủ đề, công ty, vị trí vào message; phone rỗng thì bỏ", async () => {
    createContactMock.mockResolvedValue({ ok: true });
    expect(await submitContact(valid)).toEqual({ ok: true });
    expect(createContactMock).toHaveBeenCalledWith({
      name: "A",
      email: "a@b.co",
      phone: undefined,
      message: "Chủ đề: Tuyển dụng\nCông ty: ACME\nVị trí ứng tuyển: Dev\n\nXin chào",
    });
  });

  it("API thất bại (400, mạng lỗi) thì failed, để form giữ nội dung", async () => {
    createContactMock.mockResolvedValue({ ok: false });
    expect(await submitContact(valid)).toEqual({ ok: false, reason: "failed" });
  });
});
