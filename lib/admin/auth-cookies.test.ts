import { describe, expect, it } from "vitest";
import { parseSetCookie } from "./auth-cookies";

const lines = [
  "crmspd_at=aaa.bbb.ccc; Max-Age=900; Path=/; HttpOnly; SameSite=Lax",
  "crmspd_rt=ddd.eee.fff; Max-Age=604800; Path=/api/auth; HttpOnly; SameSite=Lax",
  "crmspd_csrf=abc123; Max-Age=604800; Path=/; SameSite=Lax",
];

describe("parseSetCookie", () => {
  it("lấy giá trị và Max-Age đúng cookie theo tên", () => {
    expect(parseSetCookie(lines, "crmspd_at")).toEqual({ value: "aaa.bbb.ccc", maxAge: 900 });
    expect(parseSetCookie(lines, "crmspd_rt")).toEqual({ value: "ddd.eee.fff", maxAge: 604800 });
  });

  it("không có Max-Age thì maxAge là null", () => {
    expect(parseSetCookie(["crmspd_at=xyz; Path=/; HttpOnly"], "crmspd_at")).toEqual({
      value: "xyz",
      maxAge: null,
    });
    expect(
      parseSetCookie(["crmspd_at=xyz; Expires=Wed, 21 Oct 2026 07:28:00 GMT"], "crmspd_at"),
    ).toEqual({ value: "xyz", maxAge: null });
  });

  it("Max-Age không hợp lệ, bằng 0 hoặc âm thì maxAge là null", () => {
    for (const age of ["abc", "0", "-5", ""]) {
      expect(parseSetCookie([`crmspd_at=xyz; Max-Age=${age}`], "crmspd_at")).toEqual({
        value: "xyz",
        maxAge: null,
      });
    }
  });

  it("tên thuộc tính Max-Age không phân biệt hoa thường", () => {
    expect(parseSetCookie(["crmspd_at=xyz; max-age=60"], "crmspd_at")).toEqual({
      value: "xyz",
      maxAge: 60,
    });
  });

  it("tên phải khớp hoàn toàn, không khớp tiền tố", () => {
    expect(parseSetCookie(["crmspd_at2=x; Max-Age=1"], "crmspd_at")).toBeNull();
  });

  it("không có cookie hoặc giá trị rỗng (cookie bị xóa) thì null", () => {
    expect(parseSetCookie([], "crmspd_at")).toBeNull();
    expect(parseSetCookie(["other=1"], "crmspd_at")).toBeNull();
    expect(parseSetCookie(["crmspd_at=; Max-Age=0; Path=/"], "crmspd_at")).toBeNull();
  });

  it("giữ nguyên dấu = nằm trong giá trị", () => {
    expect(parseSetCookie(["crmspd_at=a=b=c; Max-Age=5"], "crmspd_at")).toEqual({
      value: "a=b=c",
      maxAge: 5,
    });
  });
});
