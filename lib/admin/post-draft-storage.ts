import { isFormMeaningful, type LocaleForm, type PostForm } from "./post-form";
import { POST_CATEGORIES } from "./post-types";

const PREFIX = "vcb-admin-post-draft:";

export interface StoredDraft {
  version: 1;
  savedAt: number;
  form: PostForm;
}

export const draftKey = (id: string | null): string => `${PREFIX}${id ?? "new"}`;

export function saveDraft(
  storage: Pick<Storage, "setItem">,
  id: string | null,
  form: PostForm,
  now: number = Date.now(),
): boolean {
  try {
    const draft: StoredDraft = { version: 1, savedAt: now, form };
    storage.setItem(draftKey(id), JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

function isLocaleForm(value: unknown): value is LocaleForm {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.title === "string" &&
    typeof v.excerpt === "string" &&
    typeof v.content === "string"
  );
}

function isPostForm(value: unknown): value is PostForm {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.category === "string" &&
    (POST_CATEGORIES as readonly string[]).includes(v.category) &&
    typeof v.coverUrl === "string" &&
    isLocaleForm(v.vi) &&
    isLocaleForm(v.en)
  );
}

export function loadDraft(
  storage: Pick<Storage, "getItem">,
  id: string | null,
): StoredDraft | null {
  try {
    const raw = storage.getItem(draftKey(id));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const p = parsed as Record<string, unknown>;
    if (p.version !== 1 || typeof p.savedAt !== "number" || !isPostForm(p.form)) {
      return null;
    }
    // Bản nháp cũ chưa có featured: chuẩn hoá, và dựng theo đúng thứ tự khoá của emptyForm()
    // để JSON.stringify trong shouldOfferDraft không báo khác oan.
    const form: PostForm = {
      category: p.form.category,
      coverUrl: p.form.coverUrl,
      vi: p.form.vi,
      en: p.form.en,
      featured: p.form.featured === true,
    };
    return { version: 1, savedAt: p.savedAt, form };
  } catch {
    return null;
  }
}

export function clearDraft(storage: Pick<Storage, "removeItem">, id: string | null): void {
  try {
    storage.removeItem(draftKey(id));
  } catch {
    // Trình duyệt chặn bộ nhớ: bỏ qua.
  }
}

// Hỏi khôi phục khi bản nháp có nội dung, mới hơn bản đã lưu trên server và khác nội dung hiện tại.
export function shouldOfferDraft(
  draft: StoredDraft,
  serverUpdatedAt: string | undefined,
  current: PostForm,
): boolean {
  if (!isFormMeaningful(draft.form)) return false;
  if (serverUpdatedAt) {
    const serverTime = Date.parse(serverUpdatedAt);
    if (!Number.isNaN(serverTime) && draft.savedAt <= serverTime) return false;
  }
  return JSON.stringify(draft.form) !== JSON.stringify(current);
}
