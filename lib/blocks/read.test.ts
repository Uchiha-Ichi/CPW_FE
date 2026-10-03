import { describe, expect, it } from "vitest";
import { list, num, str } from "./read";

describe("str", () => {
  it("trả chuỗi không rỗng", () => {
    expect(str("abc")).toBe("abc");
  });
  it("trả undefined với rỗng, toàn khoảng trắng, hoặc không phải chuỗi", () => {
    expect(str("")).toBeUndefined();
    expect(str("   ")).toBeUndefined();
    expect(str(5)).toBeUndefined();
    expect(str(null)).toBeUndefined();
    expect(str(undefined)).toBeUndefined();
    expect(str({})).toBeUndefined();
  });
});

describe("num", () => {
  it("trả số hữu hạn", () => {
    expect(num(10)).toBe(10);
    expect(num(0)).toBe(0);
  });
  it("trả undefined với NaN, Infinity hoặc không phải số", () => {
    expect(num(Number.NaN)).toBeUndefined();
    expect(num(Infinity)).toBeUndefined();
    expect(num("10")).toBeUndefined();
  });
});

describe("list", () => {
  it("giữ phần tử là object, bỏ phần còn lại", () => {
    expect(list([{ a: 1 }, 3, null, "x", [1], { b: 2 }])).toEqual([{ a: 1 }, { b: 2 }]);
  });
  it("trả mảng rỗng khi không phải mảng", () => {
    expect(list(undefined)).toEqual([]);
    expect(list("abc")).toEqual([]);
    expect(list({ a: 1 })).toEqual([]);
  });
});
