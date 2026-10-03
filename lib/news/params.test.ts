import { describe, expect, it } from "vitest";
import { buildNewsQuery, parseCategory, parsePage } from "./params";

describe("parsePage", () => {
  it("số nguyên dương hợp lệ", () => {
    expect(parsePage("1")).toBe(1);
    expect(parsePage("7")).toBe(7);
  });
  it("thiếu hoặc sai định dạng thì là trang 1", () => {
    for (const bad of [undefined, "", "abc", "0", "-1", "1.5", " 2", "2 ", "1e3", "0x10", "٣"]) {
      expect(parsePage(bad)).toBe(1);
    }
  });
  it("mảng thì lấy phần tử đầu", () => {
    expect(parsePage(["3", "4"])).toBe(3);
    expect(parsePage([])).toBe(1);
  });
  it("số quá lớn bị chặn ở 10000 (rồi bị coi là vượt tổng số trang)", () => {
    expect(parsePage("99999999999999999999")).toBe(10000);
    expect(parsePage("10001")).toBe(10000);
  });
});

describe("parseCategory", () => {
  it("chỉ nhận chuyên mục có thật", () => {
    expect(parseCategory("news")).toBe("news");
    expect(parseCategory("life-at-company")).toBe("life-at-company");
    expect(parseCategory("hack")).toBeUndefined();
    expect(parseCategory(undefined)).toBeUndefined();
    expect(parseCategory(["recruitment", "news"])).toBe("recruitment");
    expect(parseCategory("constructor")).toBeUndefined();
  });
});

describe("buildNewsQuery", () => {
  it("bỏ tham số mặc định", () => {
    expect(buildNewsQuery({})).toBe("");
    expect(buildNewsQuery({ page: 1 })).toBe("");
  });
  it("giữ chuyên mục và trang từ 2", () => {
    expect(buildNewsQuery({ page: 2 })).toBe("?page=2");
    expect(buildNewsQuery({ category: "news" })).toBe("?category=news");
    expect(buildNewsQuery({ category: "news", page: 3 })).toBe("?category=news&page=3");
  });
});
