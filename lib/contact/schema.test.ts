import { describe, expect, it } from "vitest";
import { contactSchema, parseJobParam, parseTopicParam } from "./schema";

const valid = {
  name: "Nguyễn Văn A",
  email: "a@b.co",
  topic: "business" as const,
  message: "Xin chào",
};

const firstIssue = (input: unknown) => {
  const r = contactSchema.safeParse(input);
  return r.success ? undefined : r.error.issues[0].message;
};

describe("contactSchema", () => {
  it("nhận dữ liệu tối thiểu hợp lệ và cắt khoảng trắng hai đầu", () => {
    const r = contactSchema.safeParse({ ...valid, name: "  A  " });
    expect(r.success && r.data.name).toBe("A");
  });

  it("phone, company, job cho phép rỗng hoặc vắng", () => {
    expect(contactSchema.safeParse({ ...valid, phone: "", company: "", job: "" }).success).toBe(true);
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("thiếu tên, nội dung: mã required", () => {
    expect(firstIssue({ ...valid, name: "   " })).toBe("required");
    expect(firstIssue({ ...valid, message: "" })).toBe("required");
  });

  it("email sai: mã email; email rỗng: mã required", () => {
    expect(firstIssue({ ...valid, email: "khong-phai-email" })).toBe("email");
    expect(firstIssue({ ...valid, email: "" })).toBe("required");
  });

  it("quá dài: mã tooLong", () => {
    expect(firstIssue({ ...valid, message: "x".repeat(5001) })).toBe("tooLong");
    expect(firstIssue({ ...valid, name: "x".repeat(101) })).toBe("tooLong");
  });

  it("chủ đề lạ bị từ chối", () => {
    expect(contactSchema.safeParse({ ...valid, topic: "hack" }).success).toBe(false);
  });
});

describe("parseTopicParam", () => {
  it("chỉ nhận chủ đề có thật, lấy phần tử đầu của mảng", () => {
    expect(parseTopicParam("careers")).toBe("careers");
    expect(parseTopicParam(["media", "x"])).toBe("media");
    expect(parseTopicParam("hack")).toBeUndefined();
    expect(parseTopicParam(undefined)).toBeUndefined();
    expect(parseTopicParam("constructor")).toBeUndefined();
  });
});

describe("parseJobParam", () => {
  it("cắt khoảng trắng, bỏ rỗng, giới hạn 200 ký tự", () => {
    expect(parseJobParam("  Lập trình viên ")).toBe("Lập trình viên");
    expect(parseJobParam("   ")).toBeUndefined();
    expect(parseJobParam(undefined)).toBeUndefined();
    expect(parseJobParam(["A", "B"])).toBe("A");
    expect(parseJobParam("x".repeat(500))).toHaveLength(200);
  });
});
