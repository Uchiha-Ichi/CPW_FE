import { describe, expect, it } from "vitest";
import { repeatToMin } from "./marquee";

describe("repeatToMin", () => {
  it("lặp tới khi đủ số phần tử tối thiểu", () => {
    expect(repeatToMin(["a", "b", "c"], 8)).toEqual(["a", "b", "c", "a", "b", "c", "a", "b", "c"]);
  });
  it("giữ nguyên khi đã đủ", () => {
    expect(repeatToMin(["a", "b"], 2)).toEqual(["a", "b"]);
    expect(repeatToMin(["a", "b", "c"], 2)).toEqual(["a", "b", "c"]);
  });
  it("mảng rỗng trả mảng rỗng, không chia cho 0", () => {
    expect(repeatToMin([], 8)).toEqual([]);
  });
});
