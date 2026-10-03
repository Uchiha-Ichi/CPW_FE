import { describe, expect, it } from "vitest";
import { splitParagraphs } from "./text";

describe("splitParagraphs", () => {
  it("tách theo dòng trống, bỏ khoảng trắng thừa và đoạn rỗng", () => {
    expect(splitParagraphs("A\n\nB \n\n\n  \nC")).toEqual(["A", "B", "C"]);
  });
  it("giữ xuống dòng đơn trong một đoạn", () => {
    expect(splitParagraphs("a\nb")).toEqual(["a\nb"]);
  });
  it("xử lý CRLF", () => {
    expect(splitParagraphs("a\r\n\r\nb")).toEqual(["a", "b"]);
  });
  it("rỗng hoặc undefined thì mảng rỗng", () => {
    expect(splitParagraphs(undefined)).toEqual([]);
    expect(splitParagraphs("  \n ")).toEqual([]);
  });
});
