import { describe, expect, it } from "vitest";
import {
  buildCareersQuery,
  departmentKeyOf,
  employmentTypeOf,
  filterJobsByDepartment,
  parseDepartment,
} from "./constants";

describe("departmentKeyOf", () => {
  it("map đủ bốn nhóm của backend", () => {
    expect(departmentKeyOf("Kinh doanh")).toBe("business");
    expect(departmentKeyOf("Sáng tạo")).toBe("creative");
    expect(departmentKeyOf("Vận hành")).toBe("operations");
    expect(departmentKeyOf("Công nghệ")).toBe("technology");
  });
  it("giá trị lạ (kể cả tên thuộc tính của Object) thì undefined", () => {
    expect(departmentKeyOf("Khác")).toBeUndefined();
    expect(departmentKeyOf("constructor")).toBeUndefined();
    expect(departmentKeyOf("__proto__")).toBeUndefined();
  });
});

describe("parseDepartment", () => {
  it("chỉ nhận khóa hợp lệ, lấy phần tử đầu của mảng", () => {
    expect(parseDepartment("business")).toBe("business");
    expect(parseDepartment(["creative", "x"])).toBe("creative");
    expect(parseDepartment("nope")).toBeUndefined();
    expect(parseDepartment(undefined)).toBeUndefined();
  });
});

describe("filterJobsByDepartment", () => {
  const jobs = [
    { slug: "a", department: "Công nghệ" },
    { slug: "b", department: "Kinh doanh" },
    { slug: "c", department: "Lạ" },
  ];
  it("không có khóa thì giữ nguyên", () => {
    expect(filterJobsByDepartment(jobs, undefined)).toHaveLength(3);
  });
  it("lọc đúng nhóm", () => {
    expect(filterJobsByDepartment(jobs, "technology").map((j) => j.slug)).toEqual(["a"]);
  });
});

describe("buildCareersQuery", () => {
  it("không có department thì rỗng", () => {
    expect(buildCareersQuery({})).toBe("");
  });

  it("có department thì gắn đúng query", () => {
    expect(buildCareersQuery({ department: "creative" })).toBe("?department=creative");
  });
});

describe("employmentTypeOf", () => {
  it("map ba hình thức của backend sang schema.org", () => {
    expect(employmentTypeOf("Toàn thời gian")).toBe("FULL_TIME");
    expect(employmentTypeOf("Bán thời gian")).toBe("PART_TIME");
    expect(employmentTypeOf("Thực tập")).toBe("INTERN");
    expect(employmentTypeOf("Khác")).toBeUndefined();
    expect(employmentTypeOf("toString")).toBeUndefined();
  });
});
