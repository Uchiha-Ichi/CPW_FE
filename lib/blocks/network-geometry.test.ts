import { describe, expect, it } from "vitest";
import { parsePos, routePath, routesFrom, toPins } from "./network-geometry";

describe("parsePos", () => {
  it("đọc 'x,y' theo phần trăm", () => {
    expect(parsePos("84.4,59.2")).toEqual({ x: 84.4, y: 59.2 });
    expect(parsePos(" 10 , 20 ")).toEqual({ x: 10, y: 20 });
    expect(parsePos("0,100")).toEqual({ x: 0, y: 100 });
  });

  it("từ chối sai định dạng hoặc ngoài 0..100", () => {
    for (const bad of ["", "1", "1,2,3", "a,b", "101,5", "5,-1", "5;5", null, undefined, 5, {}]) {
      expect(parsePos(bad as unknown)).toBeNull();
    }
  });
});

describe("toPins", () => {
  const ok = { code: "VN", name: "Việt Nam", city: "Hà Nội", note: "Văn phòng chính", pos: "84.4,59.2" };

  it("chuẩn hóa code về chữ thường và giữ thông tin", () => {
    expect(toPins([ok])).toEqual([
      { code: "vn", name: "Việt Nam", city: "Hà Nội", note: "Văn phòng chính", x: 84.4, y: 59.2 },
    ]);
  });

  it("bỏ phần tử hỏng, thiếu name, pos sai, code lạ", () => {
    const pins = toPins([
      null,
      "x",
      { ...ok, code: "v n" },
      { ...ok, code: "../x" },
      { ...ok, code: "vnn" },
      { ...ok, name: "" },
      { ...ok, pos: "abc" },
      { ...ok, code: "us", name: "Mỹ", pos: "18.2,43.2" },
    ]);
    expect(pins.map((p) => p.code)).toEqual(["us"]);
  });

  it("bỏ code trùng, giữ cái đầu", () => {
    const pins = toPins([ok, { ...ok, name: "Trùng", pos: "1,1" }]);
    expect(pins).toHaveLength(1);
    expect(pins[0].name).toBe("Việt Nam");
  });

  it("thiếu city và note thì dùng chuỗi rỗng", () => {
    const pins = toPins([{ code: "th", name: "Thái Lan", pos: "80.8,52.5" }]);
    expect(pins[0]).toMatchObject({ city: "", note: "" });
  });
});

describe("routePath", () => {
  it("vẽ đường cong bậc hai trong hệ tọa độ 900x520", () => {
    const d = routePath({ x: 0, y: 0 }, { x: 100, y: 100 });
    expect(d.startsWith("M 0 0 Q ")).toBe(true);
    expect(d.endsWith(" 900 520")).toBe(true);
  });
});

describe("routesFrom", () => {
  const pins = toPins([
    { code: "vn", name: "Việt Nam", pos: "84.4,59.2" },
    { code: "us", name: "Mỹ", pos: "18.2,43.2" },
    { code: "jp", name: "Nhật Bản", pos: "89.4,38.4" },
  ]);

  it("vẽ từ vn tới từng nước còn lại", () => {
    const routes = routesFrom(pins);
    expect(routes.map((r) => r.code)).toEqual(["us", "jp"]);
    expect(routes.every((r) => r.d.startsWith("M "))).toBe(true);
  });

  it("không có vn thì không vẽ đường nào", () => {
    expect(routesFrom(pins.filter((p) => p.code !== "vn"))).toEqual([]);
  });

  it("chỉ có vn thì không có đường", () => {
    expect(routesFrom(pins.filter((p) => p.code === "vn"))).toEqual([]);
  });
});
