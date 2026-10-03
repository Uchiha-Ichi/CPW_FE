import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/admin/post-errors";
import { isConflict, pageFriendlyMessages } from "./errors";

describe("pageFriendlyMessages", () => {
  it("giữ nguyên câu lỗi 400 của server, kể cả tiền tố 'Khối n (...)'", () => {
    const body = {
      message: [
        'Khối 2 (Đầu trang): "Tiêu đề" là bắt buộc',
        "Khối 3 (Lưới thẻ) › Thẻ 1: mục trống",
      ],
    };
    expect(pageFriendlyMessages(400, body)).toEqual(body.message);
  });

  it("400 mà không có thông điệp thì báo chung", () => {
    expect(pageFriendlyMessages(400, null)).toEqual([
      "Dữ liệu chưa hợp lệ. Vui lòng kiểm tra lại.",
    ]);
  });

  it("409 lấy câu của server, thiếu thì dùng câu mặc định", () => {
    expect(
      pageFriendlyMessages(409, { message: "Trang vừa được cập nhật ở nơi khác." }),
    ).toEqual(["Trang vừa được cập nhật ở nơi khác."]);
    expect(pageFriendlyMessages(409, null)[0]).toContain("Trang vừa được cập nhật ở nơi khác");
  });

  it("404 nói về trang, không nói về bài viết", () => {
    expect(pageFriendlyMessages(404, null)[0]).toContain("trang");
    expect(pageFriendlyMessages(404, null)[0]).not.toContain("bài viết");
  });

  it("các mã còn lại có câu riêng", () => {
    expect(pageFriendlyMessages(0, null)[0]).toContain("Không kết nối được máy chủ");
    expect(pageFriendlyMessages(401, null)).toEqual(["Phiên đăng nhập đã hết hạn."]);
    expect(pageFriendlyMessages(403, null)[0]).toContain("không có quyền");
    expect(pageFriendlyMessages(413, null)[0]).toContain("quá lớn");
    expect(pageFriendlyMessages(429, null)[0]).toContain("quá nhanh");
    expect(pageFriendlyMessages(502, null)[0]).toContain("Máy chủ");
  });
});

describe("isConflict", () => {
  it("chỉ đúng với ApiError 409", () => {
    expect(isConflict(new ApiError(409, ["x"]))).toBe(true);
    expect(isConflict(new ApiError(400, ["x"]))).toBe(false);
    expect(isConflict(new Error("x"))).toBe(false);
  });
});
