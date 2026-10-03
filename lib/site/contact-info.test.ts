import { describe, expect, it } from "vitest";
import { addressLine, brandName, mapsUrl, phoneToTel } from "./contact-info";

describe("phoneToTel", () => {
  it.each([
    ["086.836.6662", "+84868366662"],
    ["0868 366 662", "+84868366662"],
    ["+84 868 366 662", "+84868366662"],
    ["(024) 3825 1234", "+842438251234"],
    ["  0868366662  ", "+84868366662"],
  ])("%s thành %s", (input, expected) => {
    expect(phoneToTel(input)).toBe(expected);
  });

  it("số không bắt đầu bằng 0 hoặc + thì chỉ giữ chữ số", () => {
    expect(phoneToTel("84 868 366 662")).toBe("84868366662");
  });

  it("chuỗi rỗng thì trả rỗng", () => {
    expect(phoneToTel("")).toBe("");
  });
});

describe("addressLine / mapsUrl", () => {
  it("ghép street và city", () => {
    expect(
      addressLine({ street: "39 Cầu Diễn, Xuân Phương", city: "Hà Nội" })
    ).toBe("39 Cầu Diễn, Xuân Phương, Hà Nội");
  });

  it("chỉ có street thì không có dấu phẩy thừa", () => {
    expect(addressLine({ street: "39 Xã Đàn" })).toBe("39 Xã Đàn");
  });

  it("thiếu street (chỉ có city hoặc không có gì) thì trả rỗng", () => {
    expect(addressLine({ city: "Hà Nội" })).toBe("");
    expect(addressLine(undefined)).toBe("");
  });

  it("mapsUrl mã hóa địa chỉ; không có địa chỉ thì trả rỗng", () => {
    expect(mapsUrl({ street: "39 Xã Đàn", city: "Hà Nội" })).toBe(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("39 Xã Đàn, Hà Nội")}`
    );
    expect(mapsUrl({ city: "Hà Nội" })).toBe("");
    expect(mapsUrl(undefined)).toBe("");
  });
});

describe("brandName", () => {
  it("lấy tên trong DB, thiếu thì dùng dự phòng", () => {
    expect(
      brandName({ name: "Viễn Chí Bảo", socials: {}, offices: {} }, "Dự phòng")
    ).toBe("Viễn Chí Bảo");
    expect(brandName({ socials: {}, offices: {} }, "Dự phòng")).toBe(
      "Dự phòng"
    );
    expect(brandName(null, "Dự phòng")).toBe("Dự phòng");
  });
});
