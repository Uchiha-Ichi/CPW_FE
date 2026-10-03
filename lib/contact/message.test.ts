import { describe, expect, it } from "vitest";
import { buildContactMessage } from "./message";

describe("buildContactMessage", () => {
  it("chỉ có chủ đề thì dòng đầu là chủ đề, cách một dòng trống rồi tới nội dung", () => {
    expect(buildContactMessage({ topic: "business", message: "Xin chào" })).toBe(
      "Chủ đề: Hợp tác kinh doanh\n\nXin chào",
    );
  });

  it("thêm công ty và vị trí khi có", () => {
    expect(
      buildContactMessage({ topic: "careers", company: "ACME", job: "Dev", message: "Tôi muốn ứng tuyển" }),
    ).toBe("Chủ đề: Tuyển dụng\nCông ty: ACME\nVị trí ứng tuyển: Dev\n\nTôi muốn ứng tuyển");
  });

  it("bỏ qua công ty và vị trí rỗng", () => {
    expect(buildContactMessage({ topic: "other", company: "", job: "", message: "m" })).toBe(
      "Chủ đề: Khác\n\nm",
    );
  });
});
