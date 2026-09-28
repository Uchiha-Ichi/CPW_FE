"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ImagePlaceholder } from "@/components/content-block/image-placeholder";
import { uploadAdminImage } from "@/lib/admin/upload-image";
import { renderNewsBody } from "@/lib/news/render-body";
import type { NewsArticle } from "@/lib/admin/news-types";

const CATEGORIES: NewsArticle["category"][] = ["Tin công ty", "Thị trường", "Sự kiện"];

interface FormState {
  title: string;
  category: NewsArticle["category"];
  date: string;
  summary: string;
  body: string;
  cover: string;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const EMPTY_FORM: FormState = {
  title: "",
  category: "Tin công ty",
  date: today(),
  summary: "",
  body: "",
  cover: "",
};

export function NewsComposerView({ articleId }: { articleId: string | null }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [status, setStatus] = useState<NewsArticle["status"]>("Bản nháp");
  const [loading, setLoading] = useState(!!articleId);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState(false);
  const [bodyError, setBodyError] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!articleId) return;
    (async () => {
      const res = await fetch("/api/admin/proxy/news");
      if (res.ok) {
        const all: NewsArticle[] = await res.json();
        const found = all.find((a) => a._id === articleId);
        if (found) {
          setForm({
            title: found.title,
            category: found.category,
            date: found.date,
            summary: found.summary ?? "",
            body: found.body ?? "",
            cover: found.cover ?? "",
          });
          setStatus(found.status);
        }
      }
      setLoading(false);
    })();
  }, [articleId]);

  const wasLive = status === "Đã đăng" && !!articleId;

  function touch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function applyFmt(kind: "h" | "l" | "q") {
    const prefix = { h: "## ", l: "- ", q: "> " }[kind];
    const ta = bodyRef.current;
    if (!ta) return;
    const v = ta.value;
    const st = ta.selectionStart;
    const en = ta.selectionEnd;
    const ls = v.lastIndexOf("\n", st - 1) + 1;
    let le = v.indexOf("\n", en);
    if (le < 0) le = v.length;
    const seg = v
      .slice(ls, le)
      .split("\n")
      .map((l) => (l.startsWith(prefix) ? l.slice(prefix.length) : prefix + l))
      .join("\n");
    const next = v.slice(0, ls) + seg + v.slice(le);
    touch("body", next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(ls, ls + seg.length);
    });
  }

  async function handleCoverChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadAdminImage(file);
      touch("cover", url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tải ảnh thất bại");
    } finally {
      setUploading(false);
    }
  }

  async function save(targetStatus: NewsArticle["status"], goBack: boolean) {
    setTitleError(false);
    setBodyError(false);
    setError(null);
    if (!form.title.trim()) {
      setTitleError(true);
      return;
    }
    if (targetStatus === "Đã đăng" && !form.body.trim()) {
      setBodyError(true);
      return;
    }
    setSaving(true);
    const record = {
      title: form.title.trim(),
      category: form.category,
      date: form.date,
      status: targetStatus,
      summary: form.summary.trim(),
      body: form.body,
      cover: form.cover,
    };
    const url = articleId ? `/api/admin/proxy/news/${articleId}` : "/api/admin/proxy/news";
    const method = articleId ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: "Có lỗi xảy ra" }));
      setError(body.message ?? "Có lỗi xảy ra");
      return;
    }
    setStatus(targetStatus);
    if (goBack) router.push("/admin/news");
  }

  if (loading) {
    return <p className="p-6 text-sm text-muted-foreground">Đang tải…</p>;
  }

  const words = form.body.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  const blocks = renderNewsBody(form.body);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin/news")}>
            Danh sách bài viết
          </Button>
          <h1 className="text-xl font-semibold">
            {articleId ? "Sửa bài viết" : "Thêm bài viết"}
          </h1>
        </div>
        <div className="space-x-2">
          {wasLive ? (
            <>
              <Button variant="outline" disabled={saving} onClick={() => save("Bản nháp", true)}>
                Gỡ về bản nháp
              </Button>
              <Button disabled={saving} onClick={() => save("Đã đăng", true)}>
                Lưu thay đổi
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" disabled={saving} onClick={() => save("Bản nháp", true)}>
                Lưu bản nháp
              </Button>
              <Button disabled={saving} onClick={() => save("Đã đăng", true)}>
                Đăng bài
              </Button>
            </>
          )}
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="space-y-3 p-4">
          <div>
            <label className="text-sm font-medium">Tiêu đề</label>
            <input
              className="mt-1 w-full rounded-md border p-2 text-sm aria-invalid:border-destructive"
              aria-invalid={titleError}
              value={form.title}
              onChange={(e) => touch("title", e.target.value)}
            />
            {titleError && (
              <p className="mt-1 text-xs text-destructive">Cần nhập tiêu đề để lưu.</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Chuyên mục</label>
              <select
                className="mt-1 w-full rounded-md border p-2 text-sm"
                value={form.category}
                onChange={(e) =>
                  touch("category", e.target.value as NewsArticle["category"])
                }
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Ngày đăng</label>
              <input
                type="date"
                className="mt-1 w-full rounded-md border p-2 text-sm"
                value={form.date}
                onChange={(e) => touch("date", e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Ảnh bìa</label>
            <div className="mt-1 flex items-center gap-3">
              {form.cover ? (
                <img src={form.cover} alt="" className="h-16 w-24 rounded-md object-cover" />
              ) : (
                <ImagePlaceholder label="ảnh bìa" className="h-16 w-24 min-h-0 text-[10px]" />
              )}
              <div className="space-x-2">
                <label className="inline-block cursor-pointer rounded-md border px-3 py-1.5 text-sm hover:bg-muted/50">
                  {uploading ? "Đang tải…" : form.cover ? "Đổi ảnh" : "Tải ảnh lên"}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    disabled={uploading}
                    onChange={handleCoverChosen}
                  />
                </label>
                {form.cover && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => touch("cover", "")}
                  >
                    Bỏ ảnh
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Tóm tắt</label>
            <textarea
              className="mt-1 w-full rounded-md border p-2 text-sm"
              style={{ minHeight: 80 }}
              value={form.summary}
              onChange={(e) => touch("summary", e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Nội dung</label>
            <div className="mt-1 space-x-2">
              <Button type="button" variant="outline" size="sm" onClick={() => applyFmt("h")}>
                Tiêu đề nhỏ
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => applyFmt("l")}>
                Danh sách
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => applyFmt("q")}>
                Trích dẫn
              </Button>
            </div>
            <textarea
              ref={bodyRef}
              className="mt-2 w-full rounded-md border p-2 font-mono text-sm aria-invalid:border-destructive"
              style={{ minHeight: 240 }}
              aria-invalid={bodyError}
              placeholder="Bắt đầu viết bài ở đây"
              value={form.body}
              onChange={(e) => touch("body", e.target.value)}
            />
            {bodyError && (
              <p className="mt-1 text-xs text-destructive">
                Cần nhập nội dung bài viết trước khi đăng.
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Dòng trống để sang đoạn mới. Chọn dòng rồi bấm nút ở trên để định dạng.
            </p>
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm font-medium">Xem trước</p>
          <article className="mt-3">
            {form.cover ? (
              <img src={form.cover} alt="" className="h-40 w-full rounded-md object-cover" />
            ) : (
              <ImagePlaceholder label="ảnh bìa bài viết" className="h-40" />
            )}
            <div className="mt-3 space-x-1 text-xs text-muted-foreground">
              <span>{form.category}</span>
              <span>·</span>
              <span>{form.date}</span>
              <span>·</span>
              <span>{minutes} phút đọc</span>
            </div>
            <h1 className="mt-2 text-2xl font-semibold">
              {form.title || "Tiêu đề bài viết"}
            </h1>
            {form.summary && <p className="mt-2 text-muted-foreground">{form.summary}</p>}
            <div className="mt-4 space-y-3">
              {blocks.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nội dung bài viết sẽ hiện ở đây khi bắt đầu viết.
                </p>
              )}
              {blocks.map((b, i) => {
                if (b.type === "heading")
                  return (
                    <h2 key={i} className="text-lg font-semibold">
                      {b.text}
                    </h2>
                  );
                if (b.type === "list")
                  return (
                    <ul key={i} className="list-disc pl-5">
                      {b.items.map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                  );
                if (b.type === "quote")
                  return (
                    <blockquote key={i} className="border-l-2 pl-3 italic text-muted-foreground">
                      {b.lines.map((line, j) => (
                        <span key={j}>
                          {line}
                          {j < b.lines.length - 1 && <br />}
                        </span>
                      ))}
                    </blockquote>
                  );
                return (
                  <p key={i}>
                    {b.lines.map((line, j) => (
                      <span key={j}>
                        {line}
                        {j < b.lines.length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                );
              })}
            </div>
          </article>
        </Card>
      </div>
    </div>
  );
}
