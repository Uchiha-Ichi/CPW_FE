"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ImagePlaceholder } from "@/components/content-block/image-placeholder";
import { uploadAdminImage } from "@/lib/admin/upload-image";

type PhotoPage = "Trang chủ" | "Về chúng tôi";
const PAGE_OPTIONS: PhotoPage[] = ["Trang chủ", "Về chúng tôi"];

interface PhotoSlot {
  _id: string;
  name: string;
  page: PhotoPage;
  slot?: string;
  image?: string;
}

const EMPTY_FORM: Omit<PhotoSlot, "_id"> = {
  name: "",
  page: "Trang chủ",
  slot: "",
  image: "",
};

export function PhotosAdminView() {
  const [slots, setSlots] = useState<PhotoSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageFilter, setPageFilter] = useState<PhotoPage | "">("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<Omit<PhotoSlot, "_id">>(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/proxy/photos");
    if (res.ok) setSlots(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const visible = pageFilter ? slots.filter((s) => s.page === pageFilter) : slots;

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setFormOpen(true);
  }

  function openEdit(slot: PhotoSlot) {
    setEditingId(slot._id);
    setForm({
      name: slot.name,
      page: slot.page,
      slot: slot.slot ?? "",
      image: slot.image ?? "",
    });
    setError(null);
    setFormOpen(true);
  }

  async function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadAdminImage(file);
      setForm((f) => ({ ...f, image: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tải ảnh thất bại");
    } finally {
      setUploading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Cần nhập tên vị trí");
      return;
    }
    const url = editingId
      ? `/api/admin/proxy/photos/${editingId}`
      : "/api/admin/proxy/photos";
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

  async function remove(slot: PhotoSlot) {
    if (!confirm(`Xóa vị trí ảnh "${slot.name}"?`)) return;
    await fetch(`/api/admin/proxy/photos/${slot._id}`, { method: "DELETE" });
    load();
  }

  if (loading) {
    return <p className="p-6 text-sm text-muted-foreground">Đang tải…</p>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Thư viện ảnh</h1>
        <Button onClick={openAdd}>Thêm vị trí ảnh</Button>
      </div>

      <select
        className="mt-4 rounded-md border p-2 text-sm"
        value={pageFilter}
        onChange={(e) => setPageFilter(e.target.value as PhotoPage | "")}
      >
        <option value="">Tất cả các trang</option>
        {PAGE_OPTIONS.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((slot) => (
          <Card key={slot._id} className="overflow-hidden">
            {slot.image ? (
              <img
                src={slot.image}
                alt={slot.name}
                className="h-32 w-full object-cover"
              />
            ) : (
              <ImagePlaceholder label={slot.name} className="h-32" />
            )}
            <div className="p-3">
              <p className="font-medium">{slot.name}</p>
              <p className="text-xs text-muted-foreground">
                {slot.page}
                {slot.slot ? ` · ${slot.slot}` : ""}
              </p>
              <div className="mt-2 space-x-2">
                <Button variant="ghost" size="sm" onClick={() => openEdit(slot)}>
                  Sửa
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => remove(slot)}
                >
                  Xóa
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {visible.length === 0 && (
          <p className="col-span-full p-6 text-center text-muted-foreground">
            Chưa có vị trí ảnh nào.
          </p>
        )}
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="font-semibold">
              {editingId ? "Sửa vị trí ảnh" : "Thêm vị trí ảnh"}
            </h2>
            <form onSubmit={submit} className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium">Tên vị trí</label>
                <input
                  className="mt-1 w-full rounded-md border p-2 text-sm"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Trang</label>
                <select
                  className="mt-1 w-full rounded-md border p-2 text-sm"
                  value={form.page}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, page: e.target.value as PhotoPage }))
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
                <label className="text-sm font-medium">Khối trên trang</label>
                <input
                  className="mt-1 w-full rounded-md border p-2 text-sm"
                  value={form.slot ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, slot: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Ảnh</label>
                <div className="mt-1 flex items-center gap-3">
                  {form.image ? (
                    <img
                      src={form.image}
                      alt=""
                      className="h-16 w-16 rounded-md object-cover"
                    />
                  ) : (
                    <ImagePlaceholder
                      label={form.name || "vị trí này"}
                      className="h-16 w-16 min-h-0 text-[10px]"
                    />
                  )}
                  <div className="space-x-2">
                    <label className="inline-block cursor-pointer rounded-md border px-3 py-1.5 text-sm hover:bg-muted/50">
                      {uploading ? "Đang tải…" : form.image ? "Đổi ảnh" : "Tải ảnh lên"}
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        disabled={uploading}
                        onChange={handleFileChosen}
                      />
                    </label>
                    {form.image && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setForm((f) => ({ ...f, image: "" }))}
                      >
                        Xóa ảnh
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit">Lưu</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
