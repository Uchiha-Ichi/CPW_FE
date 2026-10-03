import { describe, expect, it } from "vitest";
import {
  ApiError,
  errorMessages,
  friendlyMessages,
  isSessionExpired,
  stripFieldPrefix,
} from "./post-errors";

describe("stripFieldPrefix", () => {
  it("bỏ tiền tố tên trường của lỗi lồng nhau", () => {
    expect(stripFieldPrefix("cover.Thiếu đường dẫn ảnh bìa")).toBe("Thiếu đường dẫn ảnh bìa");
    expect(stripFieldPrefix("vi.title.Tiêu đề không được để trống")).toBe(
      "Tiêu đề không được để trống",
    );
  });

  it("giữ nguyên câu tiếng Việt thường", () => {
    expect(stripFieldPrefix("Chuyên mục không hợp lệ")).toBe("Chuyên mục không hợp lệ");
    expect(stripFieldPrefix("Ảnh bìa không hợp lệ. Vui lòng tải ảnh lên lại.")).toBe(
      "Ảnh bìa không hợp lệ. Vui lòng tải ảnh lên lại.",
    );
  });
});

describe("friendlyMessages", () => {
  it("đổi mã lỗi thường gặp thành câu dễ hiểu", () => {
    expect(friendlyMessages(401, null)).toEqual(["Phiên đăng nhập đã hết hạn."]);
    expect(friendlyMessages(403, null)[0]).toContain("không có quyền");
    expect(friendlyMessages(404, null)[0]).toContain("Không tìm thấy bài viết");
    expect(friendlyMessages(413, null)[0]).toContain("quá lớn");
    expect(friendlyMessages(429, null)[0]).toContain("quá nhanh");
    expect(friendlyMessages(0, null)[0]).toContain("Không kết nối được máy chủ");
    expect(friendlyMessages(500, null)[0]).toContain("Máy chủ đang gặp sự cố");
  });

  it("lỗi 400 lấy câu của server (mảng hoặc chuỗi), bỏ tiền tố", () => {
    expect(
      friendlyMessages(400, {
        message: ["cover.Thiếu đường dẫn ảnh bìa", "Chuyên mục không hợp lệ"],
      }),
    ).toEqual(["Thiếu đường dẫn ảnh bìa", "Chuyên mục không hợp lệ"]);
    expect(friendlyMessages(400, { message: "ID bài viết không hợp lệ" })).toEqual([
      "ID bài viết không hợp lệ",
    ]);
  });

  it("thiếu thông điệp thì dùng câu mặc định", () => {
    expect(friendlyMessages(400, null)[0]).toContain("chưa hợp lệ");
    expect(friendlyMessages(409, { foo: 1 })[0]).toContain("chưa hợp lệ");
  });
});

describe("ApiError helpers", () => {
  it("nhận diện phiên hết hạn chỉ với ApiError 401", () => {
    expect(isSessionExpired(new ApiError(401, ["x"]))).toBe(true);
    expect(isSessionExpired(new ApiError(400, ["x"]))).toBe(false);
    expect(isSessionExpired(new Error("x"))).toBe(false);
  });

  it("errorMessages lấy messages của ApiError, lỗi lạ thì dùng câu mặc định", () => {
    expect(errorMessages(new ApiError(400, ["a", "b"]))).toEqual(["a", "b"]);
    expect(errorMessages(new Error("boom"))[0]).toContain("Có lỗi xảy ra");
  });
});
