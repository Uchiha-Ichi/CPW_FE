import { describe, expect, it } from "vitest";
import { findCountry, getCountryOptions, latLngToPos } from "./countries";

// Khung bao (đơn vị %) của từng nước, đo trực tiếp từ các path trong public/maps/world.svg:
// [trái, phải, trên, dưới].
const SVG_BOXES: Record<string, [number, number, number, number]> = {
  vn: [77.49, 79.88, 42.03, 49.81],
  fr: [46.55, 49.84, 28.82, 33.44],
  br: [25.89, 37.44, 52.44, 70.78],
  au: [79.64, 91.7, 61.47, 78.71],
  us: [13.61, 29.82, 25.54, 41.61],
  de: [49.37, 51.65, 26.5, 30.83],
  in: [67.61, 75.32, 36.63, 50.49],
};

function posOf(code: string): { x: number; y: number } {
  const c = findCountry(code);
  if (!c) throw new Error(`thiếu ${code}`);
  const [x, y] = c.pos.split(",").map(Number);
  return { x, y };
}

describe("latLngToPos", () => {
  it("trả về chuỗi x,y một chữ số thập phân, nằm trong 0..100", () => {
    const pos = latLngToPos(21.03, 105.85);
    expect(pos).toMatch(/^\d{1,3}(\.\d)?,\d{1,3}(\.\d)?$/);
    const [x, y] = pos.split(",").map(Number);
    expect(x).toBeGreaterThanOrEqual(0);
    expect(x).toBeLessThanOrEqual(100);
    expect(y).toBeGreaterThanOrEqual(0);
    expect(y).toBeLessThanOrEqual(100);
  });

  it("kẹp kết quả vào 0..100 khi toạ độ vượt khỏi bản đồ", () => {
    for (const pos of [latLngToPos(-90, -180), latLngToPos(90, 180)]) {
      expect(pos.split(",").map(Number).every((n) => n >= 0 && n <= 100)).toBe(true);
    }
  });

  it("Bắc nằm trên Nam, Tây nằm bên trái Đông", () => {
    const [, yNorth] = latLngToPos(50, 0).split(",").map(Number);
    const [, ySouth] = latLngToPos(-30, 0).split(",").map(Number);
    expect(yNorth).toBeLessThan(ySouth);
    const [xWest] = latLngToPos(0, -60).split(",").map(Number);
    const [xEast] = latLngToPos(0, 100).split(",").map(Number);
    expect(xWest).toBeLessThan(xEast);
  });
});

describe("getCountryOptions", () => {
  const options = getCountryOptions();

  it("có đủ các quốc gia, mã 2 chữ thường, không trùng", () => {
    expect(options.length).toBeGreaterThanOrEqual(240);
    const codes = options.map((o) => o.code);
    for (const code of codes) expect(code).toMatch(/^[a-z]{2}$/);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("tên tiếng Việt, kèm tên tiếng Anh để tìm kiếm", () => {
    const vn = options.find((o) => o.code === "vn");
    expect(vn?.name).toBe("Việt Nam");
    expect(vn?.en).toBe("Vietnam");
    expect(options.find((o) => o.code === "us")?.name).toBe("Hoa Kỳ");
  });

  it("mọi mục đều có tên không rỗng và pos hợp lệ", () => {
    for (const o of options) {
      expect(o.name.trim()).not.toBe("");
      expect(o.pos).toMatch(/^\d{1,3}(\.\d)?,\d{1,3}(\.\d)?$/);
    }
  });

  it("sắp theo tên tiếng Việt", () => {
    const names = options.map((o) => o.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b, "vi"));
    expect(names).toEqual(sorted);
  });

  it("tâm mỗi nước rơi vào khung của nước đó trên world.svg (sai số 1%)", () => {
    for (const [code, [l, r, t, b]] of Object.entries(SVG_BOXES)) {
      const { x, y } = posOf(code);
      expect(x, `${code} x`).toBeGreaterThanOrEqual(l - 1);
      expect(x, `${code} x`).toBeLessThanOrEqual(r + 1);
      expect(y, `${code} y`).toBeGreaterThanOrEqual(t - 1);
      expect(y, `${code} y`).toBeLessThanOrEqual(b + 1);
    }
  });
});

describe("findCountry", () => {
  it("tìm theo mã, không phân biệt hoa thường", () => {
    expect(findCountry("VN")?.code).toBe("vn");
    expect(findCountry("vn")?.name).toBe("Việt Nam");
  });

  it("trả undefined cho mã lạ hoặc rỗng", () => {
    expect(findCountry("xx")).toBeUndefined();
    expect(findCountry("")).toBeUndefined();
    expect(findCountry(undefined)).toBeUndefined();
  });
});
