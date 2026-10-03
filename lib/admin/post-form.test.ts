import { describe, expect, it } from "vitest";
import {
  emptyForm,
  englishWarning,
  fromPost,
  htmlIsEmpty,
  isEnglishBlank,
  isFormMeaningful,
  readingMinutes,
  toPayload,
  validateForm,
  type PostForm,
} from "./post-form";
import type { AdminPost } from "./post-types";

function filled(over: Partial<PostForm> = {}): PostForm {
  const form = emptyForm();
  form.vi = { title: "Tiêu đề", excerpt: "", content: "<p>Nội dung</p>" };
  return { ...form, ...over };
}

describe("htmlIsEmpty", () => {
  it.each([undefined, null, "", "<p></p>", "<p><br></p>", "<p> </p>", "<p>&nbsp;</p>"])(
    "coi %j là trống",
    (html) => {
      expect(htmlIsEmpty(html)).toBe(true);
    },
  );

  it("nội dung có chữ hoặc có ảnh thì không trống", () => {
    expect(htmlIsEmpty("<p>Xin chào</p>")).toBe(false);
    expect(htmlIsEmpty('<p><img src="https://x/a.jpg"></p>')).toBe(false);
  });
});

describe("toPayload", () => {
  it("cắt khoảng trắng, đổi nội dung trống thành chuỗi rỗng", () => {
    const form = filled();
    form.vi = { title: "  Tiêu đề  ", excerpt: "  Tóm tắt ", content: "<p></p>" };
    expect(toPayload(form).vi).toEqual({ title: "Tiêu đề", excerpt: "Tóm tắt", content: "" });
  });

  it("bỏ en khi ô tiếng Anh trống hoàn toàn", () => {
    const form = filled();
    form.en = { title: " ", excerpt: "", content: "<p></p>" };
    expect(toPayload(form)).not.toHaveProperty("en");
  });

  it("gửi en khi có nhập", () => {
    const form = filled();
    form.en = { title: "Hello", excerpt: "", content: "<p>Hi</p>" };
    expect(toPayload(form).en).toEqual({ title: "Hello", excerpt: "", content: "<p>Hi</p>" });
  });

  it("chỉ gửi cover khi có ảnh bìa (không gửi nghĩa là xóa ảnh bìa)", () => {
    expect(toPayload(filled())).not.toHaveProperty("cover");
    expect(toPayload(filled({ coverUrl: "https://x/a.jpg" })).cover).toEqual({
      url: "https://x/a.jpg",
    });
  });

  it("chỉ gửi status khi được truyền", () => {
    expect(toPayload(filled())).not.toHaveProperty("status");
    expect(toPayload(filled(), "published").status).toBe("published");
    expect(toPayload(filled(), "draft").status).toBe("draft");
  });
});

describe("fromPost", () => {
  it("đọc bài từ API thành form, thiếu en/cover thì để trống", () => {
    const post: AdminPost = {
      _id: "1",
      slug: "bai-1",
      category: "recruitment",
      status: "draft",
      vi: { title: "Tiêu đề", content: "<p>x</p>" },
    };
    const form = fromPost(post);
    expect(form.category).toBe("recruitment");
    expect(form.coverUrl).toBe("");
    expect(form.vi).toEqual({ title: "Tiêu đề", excerpt: "", content: "<p>x</p>" });
    expect(isEnglishBlank(form.en)).toBe(true);
  });

  it("fromPost rồi toPayload giữ nguyên dữ liệu", () => {
    const post: AdminPost = {
      _id: "1",
      slug: "bai-1",
      category: "news",
      status: "published",
      cover: { url: "https://x/a.jpg", publicId: "vcb/posts/a" },
      vi: { title: "T", excerpt: "E", content: "<p>C</p>" },
      en: { title: "Hello", excerpt: "S", content: "<p>Hi</p>" },
    };
    expect(toPayload(fromPost(post))).toEqual({
      category: "news",
      vi: { title: "T", excerpt: "E", content: "<p>C</p>" },
      en: { title: "Hello", excerpt: "S", content: "<p>Hi</p>" },
      cover: { url: "https://x/a.jpg" },
    });
  });
});

describe("validateForm", () => {
  it("bản nháp chỉ cần tiêu đề tiếng Việt", () => {
    const form = emptyForm();
    expect(validateForm(form, "draft")).toEqual([
      { tab: "vi", message: "Cần nhập tiêu đề tiếng Việt để lưu." },
    ]);
    form.vi.title = "Có tiêu đề";
    expect(validateForm(form, "draft")).toEqual([]);
  });

  it("đăng bài cần nội dung tiếng Việt", () => {
    const form = filled();
    form.vi.content = "<p></p>";
    expect(validateForm(form, "published")).toEqual([
      { tab: "vi", message: "Cần nhập nội dung tiếng Việt trước khi đăng." },
    ]);
    expect(validateForm(filled(), "published")).toEqual([]);
  });

  it("từ chối tiêu đề và mô tả quá dài", () => {
    const form = filled();
    form.vi.title = "a".repeat(201);
    form.vi.excerpt = "b".repeat(201);
    const messages = validateForm(form, "draft").map((i) => i.message);
    expect(messages).toContain("Tiêu đề tiếng Việt tối đa 200 ký tự.");
    expect(messages).toContain("Mô tả ngắn tiếng Việt tối đa 200 ký tự.");
  });

  it("tiếng Anh điền dở (thiếu tiêu đề) thì báo lỗi ở tab English", () => {
    const form = filled();
    form.en = { title: "", excerpt: "", content: "<p>Hello</p>" };
    const issues = validateForm(form, "draft");
    expect(issues).toHaveLength(1);
    expect(issues[0].tab).toBe("en");
    expect(issues[0].message).toContain("thiếu tiêu đề tiếng Anh");
  });

  it("tiếng Anh trống hẳn thì không báo lỗi", () => {
    expect(validateForm(filled(), "published")).toEqual([]);
  });
});

describe("englishWarning", () => {
  it("cảnh báo mềm khi có tiêu đề tiếng Anh mà chưa có nội dung", () => {
    const form = filled();
    form.en = { title: "Hello", excerpt: "", content: "<p></p>" };
    expect(englishWarning(form)).toContain("chưa có nội dung");
  });

  it("không cảnh báo khi đủ hoặc khi trống hẳn", () => {
    const full = filled();
    full.en = { title: "Hello", excerpt: "", content: "<p>Hi</p>" };
    expect(englishWarning(full)).toBeNull();
    expect(englishWarning(filled())).toBeNull();
  });
});

describe("readingMinutes và isFormMeaningful", () => {
  it("tối thiểu 1 phút, khoảng 200 từ/phút", () => {
    expect(readingMinutes("<p>ngắn</p>")).toBe(1);
    expect(readingMinutes(`<p>${"từ ".repeat(600)}</p>`)).toBe(3);
  });

  it("form trống không có ý nghĩa, có chữ hoặc ảnh bìa thì có", () => {
    expect(isFormMeaningful(emptyForm())).toBe(false);
    expect(isFormMeaningful(filled())).toBe(true);
    expect(isFormMeaningful({ ...emptyForm(), coverUrl: "https://x/a.jpg" })).toBe(true);
  });
});
