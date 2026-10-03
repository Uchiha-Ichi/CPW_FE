import {
  MAX_EXCERPT_LENGTH,
  MAX_TITLE_LENGTH,
  type AdminPost,
  type PostCategory,
  type PostLang,
  type PostLocale,
  type PostLocalePayload,
  type PostPayload,
  type PostStatus,
} from "./post-types";

export interface LocaleForm {
  title: string;
  excerpt: string;
  content: string;
}

export interface PostForm {
  category: PostCategory;
  coverUrl: string;
  vi: LocaleForm;
  en: LocaleForm;
}

export interface FormIssue {
  tab: PostLang | "general";
  message: string;
}

function emptyLocale(): LocaleForm {
  return { title: "", excerpt: "", content: "" };
}

export function emptyForm(): PostForm {
  return { category: "news", coverUrl: "", vi: emptyLocale(), en: emptyLocale() };
}

// Editor rỗng trả về "<p></p>": coi là trống. Có ảnh thì không trống.
export function htmlIsEmpty(html: string | undefined | null): boolean {
  if (!html) return true;
  if (/<img\b/i.test(html)) return false;
  const text = html.replace(/<[^>]*>/g, "").replace(/&nbsp;/gi, " ").trim();
  return text === "";
}

function toLocaleForm(locale?: PostLocale): LocaleForm {
  return {
    title: locale?.title ?? "",
    excerpt: locale?.excerpt ?? "",
    content: locale?.content ?? "",
  };
}

export function fromPost(post: AdminPost): PostForm {
  return {
    category: post.category,
    coverUrl: post.cover?.url ?? "",
    vi: toLocaleForm(post.vi),
    en: toLocaleForm(post.en),
  };
}

export function isEnglishBlank(en: LocaleForm): boolean {
  return en.title.trim() === "" && en.excerpt.trim() === "" && htmlIsEmpty(en.content);
}

function toLocalePayload(locale: LocaleForm): PostLocalePayload {
  return {
    title: locale.title.trim(),
    excerpt: locale.excerpt.trim(),
    content: htmlIsEmpty(locale.content) ? "" : locale.content,
  };
}

// Backend: không gửi cover/en nghĩa là xóa chúng; không gửi status nghĩa là giữ nguyên.
export function toPayload(form: PostForm, status?: PostStatus): PostPayload {
  return {
    category: form.category,
    ...(status ? { status } : {}),
    vi: toLocalePayload(form.vi),
    ...(isEnglishBlank(form.en) ? {} : { en: toLocalePayload(form.en) }),
    ...(form.coverUrl ? { cover: { url: form.coverUrl } } : {}),
  };
}

export function validateForm(form: PostForm, target: PostStatus): FormIssue[] {
  const issues: FormIssue[] = [];

  const viTitle = form.vi.title.trim();
  if (!viTitle) {
    issues.push({ tab: "vi", message: "Cần nhập tiêu đề tiếng Việt để lưu." });
  } else if (viTitle.length > MAX_TITLE_LENGTH) {
    issues.push({
      tab: "vi",
      message: `Tiêu đề tiếng Việt tối đa ${MAX_TITLE_LENGTH} ký tự.`,
    });
  }
  if (form.vi.excerpt.trim().length > MAX_EXCERPT_LENGTH) {
    issues.push({
      tab: "vi",
      message: `Mô tả ngắn tiếng Việt tối đa ${MAX_EXCERPT_LENGTH} ký tự.`,
    });
  }
  if (target === "published" && htmlIsEmpty(form.vi.content)) {
    issues.push({ tab: "vi", message: "Cần nhập nội dung tiếng Việt trước khi đăng." });
  }

  if (!isEnglishBlank(form.en)) {
    const enTitle = form.en.title.trim();
    if (!enTitle) {
      issues.push({
        tab: "en",
        message:
          "Bạn đã nhập nội dung tiếng Anh nhưng thiếu tiêu đề tiếng Anh. Hãy nhập tiêu đề hoặc xóa nội dung tiếng Anh.",
      });
    } else if (enTitle.length > MAX_TITLE_LENGTH) {
      issues.push({
        tab: "en",
        message: `Tiêu đề tiếng Anh tối đa ${MAX_TITLE_LENGTH} ký tự.`,
      });
    }
    if (form.en.excerpt.trim().length > MAX_EXCERPT_LENGTH) {
      issues.push({
        tab: "en",
        message: `Mô tả ngắn tiếng Anh tối đa ${MAX_EXCERPT_LENGTH} ký tự.`,
      });
    }
  }
  return issues;
}

// Cảnh báo mềm (không chặn lưu): bản EN thiếu nội dung sẽ không hiện ở trang tiếng Anh.
export function englishWarning(form: PostForm): string | null {
  if (form.en.title.trim() && htmlIsEmpty(form.en.content)) {
    return "Bản tiếng Anh chưa có nội dung nên sẽ chưa hiện ở trang tiếng Anh.";
  }
  return null;
}

export function readingMinutes(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function isFormMeaningful(form: PostForm): boolean {
  return (
    form.coverUrl !== "" ||
    [form.vi, form.en].some(
      (l) => l.title.trim() !== "" || l.excerpt.trim() !== "" || !htmlIsEmpty(l.content),
    )
  );
}
