"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ResourceConfig } from "@/lib/admin/resource-config";

type Item = Record<string, any> & { _id: string };

export function AdminResourceTable({ config }: { config: ResourceConfig }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Item | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/proxy/${config.path}`);
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.path]);

  function openAdd() {
    setEditing(null);
    const initial: Record<string, string> = {};
    config.fields.forEach((f) => (initial[f.key] = ""));
    setFormData(initial);
    setError(null);
    setFormOpen(true);
  }

  function openEdit(item: Item) {
    setEditing(item);
    const initial: Record<string, string> = {};
    config.fields.forEach((f) => (initial[f.key] = item[f.key] ?? ""));
    setFormData(initial);
    setError(null);
    setFormOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const missing = config.fields.find(
      (f) => f.required && !formData[f.key]?.trim()
    );
    if (missing) {
      setError(`Cần nhập ${missing.label.toLowerCase()}`);
      return;
    }
    const method = editing ? "PATCH" : "POST";
    const url = editing
      ? `/api/admin/proxy/${config.path}/${editing._id}`
      : `/api/admin/proxy/${config.path}`;
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: "Có lỗi xảy ra" }));
      setError(body.message ?? "Có lỗi xảy ra");
      return;
    }
    setFormOpen(false);
    load();
  }

  async function remove(item: Item) {
    if (!confirm(`Xóa "${item[config.fields[0].key]}"?`)) return;
    await fetch(`/api/admin/proxy/${config.path}/${item._id}`, {
      method: "DELETE",
    });
    load();
  }

  if (loading) {
    return <p className="p-6 text-sm text-muted-foreground">Đang tải…</p>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{config.label}</h1>
        <Button onClick={openAdd}>Thêm {config.singular}</Button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {config.columns.map((c) => (
                <th key={c.key} className="p-3 text-left font-medium">
                  {c.label}
                </th>
              ))}
              <th className="p-3 text-right font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id} className="border-b last:border-0">
                {config.columns.map((c) => (
                  <td key={c.key} className="p-3">
                    {String(item[c.key] ?? "")}
                  </td>
                ))}
                <td className="space-x-2 p-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                    Sửa
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => remove(item)}
                  >
                    Xóa
                  </Button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={config.columns.length + 1}
                  className="p-6 text-center text-muted-foreground"
                >
                  Chưa có {config.singular} nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="font-semibold">
              {editing ? `Sửa ${config.singular}` : `Thêm ${config.singular}`}
            </h2>
            <form onSubmit={submit} className="mt-4 space-y-3">
              {config.fields.map((f) => (
                <div key={f.key}>
                  <label className="text-sm font-medium">{f.label}</label>
                  {f.type === "select" ? (
                    <select
                      className="mt-1 w-full rounded-md border p-2 text-sm"
                      value={formData[f.key] ?? ""}
                      onChange={(e) =>
                        setFormData((d) => ({ ...d, [f.key]: e.target.value }))
                      }
                    >
                      <option value="">— chọn —</option>
                      {f.options?.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="mt-1 w-full rounded-md border p-2 text-sm"
                      value={formData[f.key] ?? ""}
                      onChange={(e) =>
                        setFormData((d) => ({ ...d, [f.key]: e.target.value }))
                      }
                    />
                  )}
                </div>
              ))}
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
