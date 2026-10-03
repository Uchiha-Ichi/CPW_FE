import { describe, expect, it } from "vitest";
import {
  EDITOR_HTML_TAGS,
  IMAGE_OPTIONS,
  STARTER_KIT_OPTIONS,
  isAllowedLinkUrl,
  isImageFile,
} from "./post-editor-config";

// Danh sách thẻ backend giữ lại khi sanitize (src/posts/post-content.ts của cpw_be).
const BACKEND_ALLOWED_TAGS = [
  "p", "h2", "h3", "strong", "em", "u", "ul", "ol", "li",
  "blockquote", "a", "img", "figure", "figcaption", "br",
];

describe("cấu hình trình soạn", () => {
  it("chỉ tạo những thẻ mà backend giữ lại", () => {
    for (const tag of EDITOR_HTML_TAGS) {
      expect(BACKEND_ALLOWED_TAGS).toContain(tag);
    }
  });

  it("tắt các định dạng mà backend sẽ xóa âm thầm", () => {
    expect(STARTER_KIT_OPTIONS.strike).toBe(false);
    expect(STARTER_KIT_OPTIONS.code).toBe(false);
    expect(STARTER_KIT_OPTIONS.codeBlock).toBe(false);
    expect(STARTER_KIT_OPTIONS.horizontalRule).toBe(false);
    expect(STARTER_KIT_OPTIONS.heading).toEqual({ levels: [2, 3] });
  });

  it("không cho ảnh base64", () => {
    expect(IMAGE_OPTIONS.allowBase64).toBe(false);
  });
});

describe("isAllowedLinkUrl", () => {
  it.each(["https://a.com", "http://a.com/x?y=1", "mailto:a@b.com", "HTTPS://A.COM"])(
    "cho phép %s",
    (url) => {
      expect(isAllowedLinkUrl(url)).toBe(true);
    },
  );

  it.each(["javascript:alert(1)", "data:text/html,x", "tel:0123", "ftp://a.com", "//evil.com", ""])(
    "chặn %j",
    (url) => {
      expect(isAllowedLinkUrl(url)).toBe(false);
    },
  );
});

describe("isImageFile", () => {
  it("nhận tệp có kiểu image/*", () => {
    expect(isImageFile(new File(["x"], "a.png", { type: "image/png" }))).toBe(true);
    expect(isImageFile(new File(["x"], "a.pdf", { type: "application/pdf" }))).toBe(false);
  });
});
