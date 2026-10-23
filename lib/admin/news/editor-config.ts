import type { StarterKitOptions } from "@tiptap/starter-kit";

// Backend chỉ giữ p,h2,h3,strong,em,u,ul,ol,li,blockquote,a,img,figure,figcaption,br
// và liên kết http(s)/mailto. Định dạng khác sẽ bị xóa âm thầm khi lưu nên phải tắt từ editor.
export const EDITOR_HTML_TAGS = [
  "p", "h2", "h3", "strong", "em", "u", "ul", "ol", "li", "blockquote", "a", "img", "br",
] as const;

export function isAllowedLinkUrl(url: string): boolean {
  return /^(https?:|mailto:)/i.test(url.trim());
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

export const STARTER_KIT_OPTIONS: Partial<StarterKitOptions> = {
  heading: { levels: [2, 3] },
  strike: false,
  code: false,
  codeBlock: false,
  horizontalRule: false,
  link: {
    openOnClick: false,
    autolink: true,
    defaultProtocol: "https",
    isAllowedUri: (url: string) => isAllowedLinkUrl(url),
  },
};

export const IMAGE_OPTIONS = { inline: false, allowBase64: false } as const;
