import { describe, expect, it } from "vitest";
import { emptyForm, type PostForm } from "./post-form";
import {
  clearDraft,
  draftKey,
  loadDraft,
  saveDraft,
  shouldOfferDraft,
} from "./post-draft-storage";

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
}

const form = (): PostForm => {
  const f = emptyForm();
  f.vi = { title: "Tiêu đề", excerpt: "", content: "<p>Nội dung</p>" };
  return f;
};

describe("draft storage", () => {
  it("khóa khác nhau cho bài mới và bài đã có", () => {
    expect(draftKey(null)).not.toBe(draftKey("abc"));
    expect(draftKey("abc")).toContain("abc");
  });

  it("lưu rồi đọc lại đúng dữ liệu", () => {
    const s = memoryStorage();
    expect(saveDraft(s, "abc", form(), 1000)).toBe(true);
    expect(loadDraft(s, "abc")).toEqual({ version: 1, savedAt: 1000, form: form() });
    expect(loadDraft(s, null)).toBeNull();
  });

  it("xóa bản nháp", () => {
    const s = memoryStorage();
    saveDraft(s, null, form());
    clearDraft(s, null);
    expect(loadDraft(s, null)).toBeNull();
  });

  it("dữ liệu hỏng hoặc sai phiên bản thì bỏ qua, không ném lỗi", () => {
    const s = memoryStorage();
    s.data.set(draftKey("a"), "{not json");
    expect(loadDraft(s, "a")).toBeNull();
    s.data.set(draftKey("b"), JSON.stringify({ version: 2, savedAt: 1, form: form() }));
    expect(loadDraft(s, "b")).toBeNull();
    s.data.set(
      draftKey("c"),
      JSON.stringify({ version: 1, savedAt: 1, form: { ...form(), category: "khong-co" } }),
    );
    expect(loadDraft(s, "c")).toBeNull();
    s.data.set(draftKey("d"), JSON.stringify({ version: 1, savedAt: "x", form: form() }));
    expect(loadDraft(s, "d")).toBeNull();
  });

  it("bộ nhớ đầy hoặc bị chặn thì saveDraft trả false, không ném lỗi", () => {
    const broken = {
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    };
    expect(saveDraft(broken, "a", form())).toBe(false);
    const brokenRead = {
      getItem: () => {
        throw new Error("SecurityError");
      },
    };
    expect(loadDraft(brokenRead, "a")).toBeNull();
    const brokenRemove = {
      removeItem: () => {
        throw new Error("SecurityError");
      },
    };
    expect(() => clearDraft(brokenRemove, "a")).not.toThrow();
  });
});

describe("shouldOfferDraft", () => {
  const draft = (savedAt: number, f = form()) => ({ version: 1 as const, savedAt, form: f });

  it("bài mới: đề nghị khôi phục khi bản nháp có nội dung", () => {
    expect(shouldOfferDraft(draft(5), undefined, emptyForm())).toBe(true);
    expect(shouldOfferDraft(draft(5, emptyForm()), undefined, emptyForm())).toBe(false);
  });

  it("bài đã lưu: chỉ đề nghị khi nháp mới hơn bản trên server và khác nội dung", () => {
    const serverTime = "2026-09-30T10:00:00.000Z";
    const later = Date.parse(serverTime) + 1000;
    const earlier = Date.parse(serverTime) - 1000;
    const changed = form();
    changed.vi.title = "Đã sửa";
    expect(shouldOfferDraft(draft(later, changed), serverTime, form())).toBe(true);
    expect(shouldOfferDraft(draft(earlier, changed), serverTime, form())).toBe(false);
    expect(shouldOfferDraft(draft(later, form()), serverTime, form())).toBe(false);
  });
});
