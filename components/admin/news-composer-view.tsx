"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminNotice } from "@/components/admin/ui/admin-notice";
import { AdminPage } from "@/components/admin/ui/admin-page";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminPanel } from "@/components/admin/ui/admin-panel";
import { AdminSelect } from "@/components/admin/ui/admin-select";
import { AdminTextarea } from "@/components/admin/ui/admin-textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ImagePlaceholder } from "@/components/shared/image-placeholder";
import { CoverField } from "@/components/admin/post-cover-field";
import { PostEditor } from "@/components/admin/post-editor";
import {
  createPost,
  getAdminPost,
  updatePost,
  uploadPostImage,
} from "@/lib/admin/post-api";
import { errorMessages, isSessionExpired } from "@/lib/admin/post-errors";
import {
  clearDraft,
  loadDraft,
  saveDraft,
  shouldOfferDraft,
  type StoredDraft,
} from "@/lib/admin/post-draft-storage";
import {
  emptyForm,
  englishWarning,
  fromPost,
  isEnglishBlank,
  readingMinutes,
  toPayload,
  validateForm,
  type FormIssue,
  type PostForm,
} from "@/lib/admin/post-form";
import {
  POST_CATEGORIES,
  POST_CATEGORY_LABELS,
  type AdminPost,
  type PostCategory,
  type PostLang,
  type PostStatus,
} from "@/lib/admin/post-types";

const LANG_LABELS: Record<PostLang, string> = {
  vi: "Tiếng Việt",
  en: "English",
};

function formatDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("vi-VN");
}

export function NewsComposerView({ articleId }: { articleId: string | null }) {
  const router = useRouter();
  const [form, setForm] = useState<PostForm>(emptyForm);
  const [serverPost, setServerPost] = useState<AdminPost | null>(null);
  const [lang, setLang] = useState<PostLang>("vi");
  const [loading, setLoading] = useState(!!articleId);
  const [loadError, setLoadError] = useState<string[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [issues, setIssues] = useState<FormIssue[]>([]);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [pendingDraft, setPendingDraft] = useState<StoredDraft | null>(null);
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null);

  const busy = saving || uploadingImages;

  // Xem trước ảnh bìa vừa chọn (giá trị dẫn xuất, giải phóng URL khi unmount/đổi tệp).
  const newCoverPreview = useMemo(() => {
    return newCoverFile ? URL.createObjectURL(newCoverFile) : null;
  }, [newCoverFile]);

  useEffect(() => {
    return () => {
      if (newCoverPreview) URL.revokeObjectURL(newCoverPreview);
    };
  }, [newCoverPreview]);

  // Dán ảnh (Ctrl+V) làm ảnh bìa CHỈ khi con trỏ ở ngoài khung soạn; trong khung soạn ảnh chèn vào bài.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest(".ProseMirror")) return;
      const file = Array.from(e.clipboardData?.items ?? [])
        .find((item) => item.type.startsWith("image/"))
        ?.getAsFile();
      if (file) {
        setNewCoverFile(file);
        setDirty(true);
      }
    };
    const preventDefault = (e: DragEvent) => e.preventDefault();
    document.addEventListener("paste", onPaste);
    window.addEventListener("dragover", preventDefault);
    window.addEventListener("drop", preventDefault);
    return () => {
      document.removeEventListener("paste", onPaste);
      window.removeEventListener("dragover", preventDefault);
      window.removeEventListener("drop", preventDefault);
    };
  }, []);

  // Tải bài (sửa) hoặc kiểm tra bản nháp còn sót (bài mới).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!articleId) {
        const draft = loadDraft(window.localStorage, null);
        if (
          !cancelled &&
          draft &&
          shouldOfferDraft(draft, undefined, emptyForm())
        ) {
          setPendingDraft(draft);
        }
        return;
      }
      try {
        const post = await getAdminPost(articleId);
        if (cancelled) return;
        const loaded = fromPost(post);
        setServerPost(post);
        setForm(loaded);
        setEditorKey((k) => k + 1);
        const draft = loadDraft(window.localStorage, articleId);
        if (draft && shouldOfferDraft(draft, post.updatedAt, loaded)) {
          setPendingDraft(draft);
        }
      } catch (err) {
        if (cancelled) return;
        setLoadError(errorMessages(err));
        if (isSessionExpired(err)) setSessionExpired(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [articleId]);

  // Tự lưu nháp vào trình duyệt sau 1,5 giây ngừng gõ.
  useEffect(() => {
    if (!dirty || loading) return;
    const timer = setTimeout(
      () => saveDraft(window.localStorage, articleId, form),
      1500
    );
    return () => clearTimeout(timer);
  }, [form, dirty, loading, articleId]);

  // Cảnh báo khi rời trang lúc còn thay đổi chưa lưu.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  function updateLocale(
    l: PostLang,
    key: "title" | "excerpt" | "content",
    value: string
  ) {
    setForm((f) => ({ ...f, [l]: { ...f[l], [key]: value } }));
    setDirty(true);
  }

  function updateCategory(category: PostCategory) {
    setForm((f) => ({ ...f, category }));
    setDirty(true);
  }

  function updateFeatured(featured: boolean) {
    setForm((f) => ({ ...f, featured }));
    setDirty(true);
  }

  function pickCover(file: File) {
    setNewCoverFile(file);
    setDirty(true);
  }

  function removeCover() {
    setNewCoverFile(null);
    setForm((f) => ({ ...f, coverUrl: "" }));
    setDirty(true);
  }

  function restoreDraft() {
    if (!pendingDraft) return;
    setForm(pendingDraft.form);
    setEditorKey((k) => k + 1);
    setDirty(true);
    setPendingDraft(null);
  }

  function discardDraft() {
    clearDraft(window.localStorage, articleId);
    setPendingDraft(null);
  }

  async function save(target: PostStatus) {
    setErrors([]);
    setIssues([]);
    const found = validateForm(form, target);
    if (found.length > 0) {
      setIssues(found);
      const firstTab = found[0].tab;
      if (firstTab === "vi" || firstTab === "en") setLang(firstTab);
      return;
    }
    setSaving(true);
    try {
      let coverUrl = form.coverUrl;
      if (newCoverFile) {
        coverUrl = (await uploadPostImage(newCoverFile)).url;
        // Giữ URL đã tải để lần bấm lại (nếu lưu bài lỗi) không tải lại ảnh.
        setForm((f) => ({ ...f, coverUrl }));
        setNewCoverFile(null);
      }
      const payload = toPayload({ ...form, coverUrl }, target);
      if (articleId) await updatePost(articleId, payload);
      else await createPost(payload);
      clearDraft(window.localStorage, articleId);
      setDirty(false);
      router.push("/admin/news");
    } catch (err) {
      setErrors(errorMessages(err));
      if (isSessionExpired(err)) setSessionExpired(true);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminPage width="wide">
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      </AdminPage>
    );
  }

  if (loadError) {
    return (
      <AdminPage width="wide">
        <AdminNotice tone="danger">
          {loadError.join(" ")}
          {sessionExpired && <LoginAgainLink />}
        </AdminNotice>
        <AdminButton
          className="mt-4"
          variant="outline"
          onClick={() => router.push("/admin/news")}
        >
          Danh sách bài viết
        </AdminButton>
      </AdminPage>
    );
  }

  const wasLive = serverPost?.status === "published";
  const current = form[lang];
  const previewHtml = current.content;
  const coverPreview = newCoverPreview || form.coverUrl || null;
  const langIssues = issues.filter((i) => i.tab === lang);
  const titleInvalid = langIssues.some((i) => /tiêu đề/i.test(i.message));
  const warning = englishWarning(form);
  const publishedDate = wasLive ? formatDate(serverPost?.publishedAt) : "";

  return (
    <AdminPage width="wide">
      <AdminButton
        variant="ghost"
        size="sm"
        className="-ml-2 mb-2"
        onClick={() => router.push("/admin/news")}
      >
        <ArrowLeft aria-hidden />
        Danh sách bài viết
      </AdminButton>
      <AdminPageHeader
        title={articleId ? "Sửa bài viết" : "Thêm bài viết"}
        actions={
          <>
            {uploadingImages && (
              <span className="text-sm text-muted-foreground">Đang tải ảnh…</span>
            )}
            {wasLive ? (
              <>
                <AdminButton
                  variant="outline"
                  disabled={busy}
                  onClick={() => save("draft")}
                >
                  Gỡ về bản nháp
                </AdminButton>
                <AdminButton disabled={busy} onClick={() => save("published")}>
                  Lưu thay đổi
                </AdminButton>
              </>
            ) : (
              <>
                <AdminButton
                  variant="outline"
                  disabled={busy}
                  onClick={() => save("draft")}
                >
                  Lưu bản nháp
                </AdminButton>
                <AdminButton disabled={busy} onClick={() => save("published")}>
                  Đăng bài
                </AdminButton>
              </>
            )}
          </>
        }
      />

      {pendingDraft && (
        <AdminNotice tone="info" className="mb-4 flex flex-wrap items-center gap-2">
          <span>
            Tìm thấy bản chưa lưu lúc{" "}
            {new Date(pendingDraft.savedAt).toLocaleString("vi-VN")}.
          </span>
          <AdminButton size="sm" onClick={restoreDraft}>
            Khôi phục
          </AdminButton>
          <AdminButton size="sm" variant="ghost" onClick={discardDraft}>
            Bỏ
          </AdminButton>
        </AdminNotice>
      )}

      {sessionExpired && (
        <AdminNotice tone="danger" className="mb-4">
          Phiên đăng nhập đã hết hạn. Nội dung của bạn vẫn còn trên trang này.
          <LoginAgainLink /> rồi quay lại đây bấm lưu lại.
        </AdminNotice>
      )}

      {(errors.length > 0 || issues.length > 0) && (
        <AdminNotice tone="danger" className="mb-4">
          <ul className="list-disc space-y-1 pl-5">
            {[...issues.map((i) => i.message), ...errors].map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </AdminNotice>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminPanel className="flex flex-col gap-4 p-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="post-category">Chuyên mục</Label>
              <AdminSelect
                id="post-category"
                value={form.category}
                onChange={(e) => updateCategory(e.target.value as PostCategory)}
              >
                {POST_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {POST_CATEGORY_LABELS[c]}
                  </option>
                ))}
              </AdminSelect>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm leading-none font-medium">Ngày đăng</p>
              <p className="flex min-h-10 items-center text-sm text-muted-foreground">
                {publishedDate || "Chưa đăng"}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="post-featured"
              className="flex items-center gap-3 text-sm font-medium"
            >
              <Checkbox
                id="post-featured"
                checked={form.featured}
                onCheckedChange={updateFeatured}
                aria-describedby="post-featured-hint"
              />
              <span>Hiện ở Trang chủ (Tin tức nổi bật)</span>
            </label>
            <p
              id="post-featured-hint"
              className="pl-8 text-xs text-muted-foreground"
            >
              Trang chủ hiện tối đa 5 bài nổi bật mới đăng nhất. Chỉ bài đã đăng mới hiện.
            </p>
          </div>

          <CoverField
            previewUrl={coverPreview}
            disabled={busy}
            onPick={pickCover}
            onRemove={removeCover}
          />
          <p className="text-xs text-muted-foreground">
            Ảnh bìa và chuyên mục dùng chung cho cả tiếng Việt và tiếng Anh.
          </p>

          <p className="text-xs text-muted-foreground">
            Đường dẫn bài viết:{" "}
            {serverPost?.slug ? (
              <span className="font-mono text-foreground">
                /news/{serverPost.slug}
              </span>
            ) : (
              "sẽ tự tạo từ tiêu đề khi lưu"
            )}
          </p>

          <div role="tablist" className="flex gap-1 border-b border-[color:var(--admin-line)]">
            {(["vi", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                role="tab"
                aria-selected={lang === l}
                onClick={() => setLang(l)}
                className={cn(
                  "-mb-px min-h-11 border-b-2 px-3 py-2 text-sm transition-colors motion-reduce:transition-none",
                  lang === l
                    ? "border-[color:var(--admin-brand-strong)] font-semibold text-[color:var(--admin-brand-ink)]"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {LANG_LABELS[l]}
                {l === "en" && !isEnglishBlank(form.en) && (
                  <span
                    className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--admin-brand-strong)] align-middle"
                    aria-label="đã nhập"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="post-title">Tiêu đề ({LANG_LABELS[lang]})</Label>
            <AdminInput
              id="post-title"
              aria-invalid={titleInvalid}
              value={current.title}
              onChange={(e) => updateLocale(lang, "title", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="post-excerpt">Mô tả ngắn ({LANG_LABELS[lang]})</Label>
            <AdminTextarea
              id="post-excerpt"
              style={{ minHeight: 80 }}
              placeholder="Để trống thì hệ thống tự lấy từ phần đầu nội dung."
              value={current.excerpt}
              onChange={(e) => updateLocale(lang, "excerpt", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-sm leading-none font-medium">
              Nội dung ({LANG_LABELS[lang]})
            </p>
            <PostEditor
              key={`${lang}-${editorKey}`}
              value={current.content}
              onChange={(html) => updateLocale(lang, "content", html)}
              onError={setErrors}
              onBusyChange={setUploadingImages}
              disabled={saving}
              ariaLabel={`Nội dung bài viết (${LANG_LABELS[lang]})`}
            />
            {warning && lang === "en" && (
              <p className="pt-1 text-xs text-muted-foreground">{warning}</p>
            )}
          </div>
        </AdminPanel>

        <AdminPanel className="p-5">
          <p className="text-sm font-medium">Xem trước ({LANG_LABELS[lang]})</p>
          <article className="mt-3">
            {coverPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverPreview}
                alt=""
                className="h-40 w-full rounded-md object-cover"
              />
            ) : (
              <ImagePlaceholder label="ảnh bìa bài viết" className="h-40" />
            )}
            <div className="mt-3 space-x-1 text-xs text-muted-foreground">
              <span>{POST_CATEGORY_LABELS[form.category]}</span>
              <span>·</span>
              <span>{publishedDate || "Chưa đăng"}</span>
              <span>·</span>
              <span>{readingMinutes(previewHtml)} phút đọc</span>
            </div>
            {/* h2, không phải h1: trang đã có h1 (tên trang) và đây chỉ là bản xem trước của bài. */}
            <h2 className="mt-2 text-2xl">
              {current.title || "Tiêu đề bài viết"}
            </h2>
            {current.excerpt && (
              <p className="mt-2 text-muted-foreground">{current.excerpt}</p>
            )}
            {previewHtml.trim() ? (
              // Ngoại lệ D7 (DOCS/superpowers/specs/2026-09-30-vcb-web-admin-posts-design.md):
              // Khung Xem trước dùng dangerouslySetInnerHTML với HTML do Tiptap tạo ra hoặc server đã sanitize.
              <div
                className="post-content mt-4"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Nội dung bài viết sẽ hiện ở đây khi bắt đầu viết.
              </p>
            )}
          </article>
        </AdminPanel>
      </div>
    </AdminPage>
  );
}

function LoginAgainLink() {
  return (
    <a
      href="/admin/login"
      target="_blank"
      rel="noopener noreferrer"
      className="ml-1 font-medium underline"
    >
      Đăng nhập lại ở tab mới
    </a>
  );
}
