import { describe, expect, it } from "vitest";
import { splitAccent, stripAccent } from "./accent";

describe("splitAccent", () => {
  it("chuỗi không có dấu * là một đoạn thường", () => {
    expect(splitAccent("Xin chào")).toEqual([{ text: "Xin chào", accent: false }]);
  });

  it("tách đoạn nhấn ở giữa", () => {
    expect(splitAccent("Đưa giá trị *thủ công Việt* ra thế giới.")).toEqual([
      { text: "Đưa giá trị ", accent: false },
      { text: "thủ công Việt", accent: true },
      { text: " ra thế giới.", accent: false },
    ]);
  });

  it("nhiều đoạn nhấn và nhấn ở đầu/cuối", () => {
    expect(splitAccent("*a* b *c*")).toEqual([
      { text: "a", accent: true },
      { text: " b ", accent: false },
      { text: "c", accent: true },
    ]);
  });

  it("dấu * không khép cặp giữ nguyên là chữ", () => {
    expect(splitAccent("a *b")).toEqual([{ text: "a *b", accent: false }]);
    expect(splitAccent("**")).toEqual([{ text: "**", accent: false }]);
    expect(splitAccent("5 * 3")).toEqual([{ text: "5 * 3", accent: false }]);
  });

  it("không biến HTML thành thẻ: giữ nguyên là chữ", () => {
    expect(splitAccent("<script>alert(1)</script>")).toEqual([
      { text: "<script>alert(1)</script>", accent: false },
    ]);
    expect(splitAccent("*<b>x</b>*")).toEqual([{ text: "<b>x</b>", accent: true }]);
  });

  it("chuỗi rỗng trả mảng rỗng", () => {
    expect(splitAccent("")).toEqual([]);
  });
});

describe("stripAccent", () => {
  it("bỏ dấu nhấn, giữ chữ", () => {
    expect(stripAccent("Nơi *công nghệ* giao thoa")).toBe("Nơi công nghệ giao thoa");
    expect(stripAccent("a *b")).toBe("a *b");
  });
});
