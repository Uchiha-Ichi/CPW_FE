"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type PageName =
  | "Trang chủ"
  | "Về chúng tôi"
  | "Tuyển dụng"
  | "Liên hệ"
  | "Tin tức";
type BlockLayout =
  | "hero"
  | "text"
  | "imgleft"
  | "imgright"
  | "banner"
  | "cards"
  | "cta";

const PAGE_OPTIONS: PageName[] = [
  "Trang chủ",
  "Về chúng tôi",
  "Tuyển dụng",
  "Liên hệ",
  "Tin tức",
];

const LAYOUT_LABELS: Record<BlockLayout, string> = {
  hero: "Đầu trang",
  text: "Văn bản",
  imgleft: "Ảnh trái, chữ phải",
  imgright: "Chữ trái, ảnh phải",
  banner: "Ảnh nền rộng",
  cards: "Lưới thẻ",
  cta: "Lời kêu gọi",
};
const LAYOUT_OPTIONS = Object.keys(LAYOUT_LABELS) as BlockLayout[];

interface PageContentSnapshot {
  page: PageName;
  block: string;
  layout: BlockLayout;
  title: string;
  text?: string;
  image?: string;
  btnLabel?: string;
  btnLink?: string;
  items?: { t: string; d: string }[];
}

interface PageBlockDoc {
  _id: string;
  pub: PageContentSnapshot | null;
  draft: PageContentSnapshot | null;
}

function effective(doc: PageBlockDoc): PageContentSnapshot | null {
  return doc.draft ?? doc.pub;
}

function statusOf(doc: PageBlockDoc): string {
  if (!doc.pub) return "Chưa đăng";
  if (doc.draft) return "Có thay đổi chưa đăng";
  return "Đã đăng";
}

const EMPTY_FORM: PageContentSnapshot = {
  page: "Trang chủ",
  block: "",
  layout: "text",
  title: "",
  text: "",
  image: "",
  btnLabel: "",
  btnLink: "",
};

export function PagesAdminView() {
  const [docs, setDocs] = useState<PageBlockDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageFilter, setPageFilter] = useState<PageName | "">("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<PageContentSnapshot>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const qs = pageFilter ? `?page=${encodeURIComponent(pageFilter)}` : "";
    const res = await fetch(`/api/admin/proxy/pages${qs}`);
    if (res.ok) setDocs(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageFilter]);

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setFormOpen(true);
  }

  function openEdit(doc: PageBlockDoc) {
    const src = effective(doc);
    if (!src) return;
    setEditingId(doc._id);
    setForm(src);
    setError(null);
    setFormOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.block.trim() || !form.title.trim()) {
      setError("Cần nhập tên khối và tiêu đề");
      return;
    }
    const url = editingId
      ? `/api/admin/proxy/pages/${editingId}/draft`
      : `/api/admin/proxy/pages`;
    const method = editingId ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: "Có lỗi xảy ra" }));
      setError(body.message ?? "Có lỗi xảy ra");
      return;
    }
    setFormOpen(false);
    load();
  }

  async function publish(doc: PageBlockDoc) {
    const res = await fetch(`/api/admin/proxy/pages/${doc._id}/publish`, {
      method: "POST",
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: "Có lỗi xảy ra" }));
      alert(body.message ?? "Không đăng được");
      return;
    }
    load();
  }

  async function remove(doc: PageBlockDoc) {
    const src = effective(doc);
    if (!confirm(`Xóa "${src?.title ?? "khối này"}"?`)) return;
    await fetch(`/api/admin/proxy/pages/${doc._id}`, { method: "DELETE" });
    load();
  }

  if (loading) {
    return <p className="p-6 text-sm text-muted-foreground">Đang tải…</p>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Nội dung trang</h1>
        <Button onClick={openAdd}>Thêm khối nội dung</Button>
      </div>

      <select
        className="mt-4 rounded-md border p-2 text-sm"
        value={pageFilter}
        onChange={(e) => setPageFilter(e.target.value as PageName | "")}
      >
        <option value="">Tất cả các trang</option>
        {PAGE_OPTIONS.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      <div className="mt-4 overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-3 text-left font-medium">Tiêu đề</th>
              <th className="p-3 text-left font-medium">Khối</th>
              <th className="p-3 text-left font-medium">Trang</th>
              <th className="p-3 text-left font-medium">Trạng thái</th>
              <th className="p-3 text-right font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc) => {
              const v = effective(doc);
              if (!v) return null;
              return (
                <tr key={doc._id} className="border-b last:border-0">
                  <td className="p-3">{v.title}</td>
                  <td className="p-3">
                    {v.block}
                    <div className="text-xs text-muted-foreground">
                      {LAYOUT_LABELS[v.layout]}
                    </div>
                  </td>
                  <td className="p-3">{v.page}</td>
                  <td className="p-3">{statusOf(doc)}</td>
                  <td className="space-x-2 p-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(doc)}>
                      Sửa
                    </Button>
                    {doc.draft && (
                      <Button size="sm" onClick={() => publish(doc)}>
                        Đăng
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => remove(doc)}
                    >
                      Xóa
                    </Button>
                  </td>
                </tr>
              );
            })}
            {docs.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  Chưa có khối nội dung nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-lg p-6">
            <h2 className="font-semibold">
              {editingId ? "Sửa nội dung" : "Thêm khối nội dung"}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Thay đổi được lưu thành bản nháp và chỉ hiển thị trên website sau
              khi bấm Đăng.
            </p>
            <form onSubmit={submit} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Trang</label>
                  <select
                    className="mt-1 w-full rounded-md border p-2 text-sm"
                    value={form.page}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, page: e.target.value as PageName }))
                    }
                  >
                    {PAGE_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Kiểu khối</label>
                  <select
                    className="mt-1 w-full rounded-md border p-2 text-sm"
                    value={form.layout}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        layout: e.target.value as BlockLayout,
                      }))
                    }
                  >
                    {LAYOUT_OPTIONS.map((l) => (
                      <option key={l} value={l}>
                        {LAYOUT_LABELS[l]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Tên khối</label>
                <input
                  className="mt-1 w-full rounded-md border p-2 text-sm"
                  value={form.block}
                  onChange={(e) => setForm((f) => ({ ...f, block: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tiêu đề</label>
                <input
                  className="mt-1 w-full rounded-md border p-2 text-sm"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Nội dung</label>
                <textarea
                  className="mt-1 w-full rounded-md border p-2 text-sm"
                  value={form.text ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">URL ảnh</label>
                <input
                  className="mt-1 w-full rounded-md border p-2 text-sm"
                  value={form.image ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Nhãn nút</label>
                  <input
                    className="mt-1 w-full rounded-md border p-2 text-sm"
                    value={form.btnLabel ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, btnLabel: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Liên kết nút</label>
                  <input
                    className="mt-1 w-full rounded-md border p-2 text-sm"
                    value={form.btnLink ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, btnLink: e.target.value }))
                    }
                  />
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit">Lưu bản nháp</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
