import { describe, expect, it } from "vitest";
import { formatPostDate } from "./format";

describe("formatPostDate", () => {
  it("định dạng theo ngôn ngữ", () => {
    expect(formatPostDate("2026-09-15T05:00:00.000Z", "en")).toBe("September 15, 2026");
    expect(formatPostDate("2026-09-15T05:00:00.000Z", "vi")).toMatch(/15.*9.*2026/);
  });
  it("dùng múi giờ Việt Nam (20:00Z ngày 31/8 đã là 1/9)", () => {
    expect(formatPostDate("2026-08-31T20:00:00.000Z", "en")).toBe("September 1, 2026");
  });
  it("thiếu hoặc sai thì trả undefined", () => {
    expect(formatPostDate(undefined, "vi")).toBeUndefined();
    expect(formatPostDate("không phải ngày", "vi")).toBeUndefined();
  });
});
