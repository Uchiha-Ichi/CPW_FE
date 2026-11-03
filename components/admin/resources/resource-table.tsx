"use client";

import { useEffect, useId, useState } from "react";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminInput } from "@/components/admin/ui/admin-input";
import { AdminNotice } from "@/components/admin/ui/admin-notice";
import { AdminPage } from "@/components/admin/ui/admin-page";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminPanel } from "@/components/admin/ui/admin-panel";
import { AdminSelect } from "@/components/admin/ui/admin-select";
import { AdminTable } from "@/components/admin/ui/admin-table";
import { AdminTextarea } from "@/components/admin/ui/admin-textarea";
import { StatusChip } from "@/components/admin/ui/status-chip";
import { Label } from "@/components/ui/label";
import { MapPositionPicker } from "@/components/admin/resources/map-position-picker";
import { CountryCombobox } from "@/components/admin/resources/country-combobox";
import { ImageField } from "@/components/admin/page-editor/image-field";
import { imageHintFor } from "@/lib/blocks/image-specs";
import { errorMessages } from "@/lib/admin/api-error";
import {
  createResource,
  deleteResource,
  listResource,
  updateResource,
} from "@/lib/admin/resources/api";
import type { ResourceConfig, ResourceField } from "@/lib/admin/resources/config";

type Item = Record<string, unknown> & { _id: string };

// Màu chip theo giá trị trạng thái thật trong resource-config (Hiển thị/Ẩn, Đang tuyển/Đã đóng).
const STATUS_TONE: Record<string, "ok" | "muted" | "warn"> = {
  "Hiển thị": "ok",
  "Đang tuyển": "ok",
  "Sắp ra mắt": "warn",
  "Ẩn": "muted",
  "Đã đóng": "muted",
};

export function toPayload(
  fields: ResourceField[],
  data: Record<string, string>,
): Record<string, string | number> {
  const payload: Record<string, string | number> = { ...data };
  for (const f of fields) {
    if (f.type === "number") {
      const raw = data[f.key];
      payload[f.key] = raw !== undefined && raw.trim() !== "" ? Number(raw) : 0;
    }
  }
  return payload;
}

export function AdminResourceTable({ config }: { config: ResourceConfig }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Item | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  // Lỗi tải danh sách hoặc xóa (lỗi của form lưu nằm trong `error`, hiện trong hộp thoại).
  const [listError, setListError] = useState<string | null>(null);
  const uid = useId();
  const titleId = `${uid}-title`;

  // Tải lại sau khi lưu/xóa.
  async function load() {
    setLoading(true);
    try {
      setItems(await listResource<Item>(config.path));
      setListError(null);
    } catch (err) {
      setListError(errorMessages(err).join(" "));
    }
    setLoading(false);
  }

  // Lần tải đầu: loading đã là true từ useState nên không gọi setLoading(true); setState nằm trong callback của promise
  // (mỗi bảng là một route riêng nên config.path không đổi trong một lần mount).
  useEffect(() => {
    let cancelled = false;
    listResource<Item>(config.path)
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setListError(errorMessages(err).join(" "));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [config.path]);

  function defaultFor(f: ResourceConfig["fields"][number]): string {
    return f.type === "mappos" ? "50,50" : "";
  }

  function openAdd() {
    setEditing(null);
    const initial: Record<string, string> = {};
    config.fields.forEach((f) => (initial[f.key] = defaultFor(f)));
    setFormData(initial);
    setError(null);
    setFormOpen(true);
  }

  function openEdit(item: Item) {
    setEditing(item);
    const initial: Record<string, string> = {};
    config.fields.forEach((f) => {
      if (f.type === "number") {
        initial[f.key] = String(item[f.key] ?? "");
      } else {
        initial[f.key] =
          (item[f.key] as string | undefined) ?? defaultFor(f);
      }
    });
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
    const payload = toPayload(config.fields, formData);
    try {
      if (editing) await updateResource(config.path, editing._id, payload);
      else await createResource(config.path, payload);
    } catch (err) {
      setError(errorMessages(err).join(" "));
      return;
    }
    setFormOpen(false);
    load();
  }

  async function remove(item: Item) {
    if (!confirm(`Xóa "${item[config.fields[0].key]}"?`)) return;
    try {
      await deleteResource(config.path, item._id);
    } catch (err) {
      setListError(errorMessages(err).join(" "));
      return;
    }
    load();
  }

  if (loading) {
    return (
      <AdminPage>
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      </AdminPage>
    );
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title={config.label}
        actions={<AdminButton onClick={openAdd}>Thêm {config.singular}</AdminButton>}
      />

      {listError && (
        <AdminNotice tone="danger" className="mb-4">
          {listError}
        </AdminNotice>
      )}

      <AdminTable>
        <thead>
          <tr>
            {config.columns.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
            <th className="admin-act">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item._id}>
              {config.columns.map((c, i) => {
                const value = String(item[c.key] ?? "");
                return (
                  <td
                    key={c.key}
                    data-label={i === 0 ? undefined : c.label}
                    className={i === 0 ? "font-medium" : undefined}
                  >
                    {c.key === "status" && value !== "" ? (
                      <StatusChip tone={STATUS_TONE[value] ?? "muted"}>{value}</StatusChip>
                    ) : (
                      value
                    )}
                  </td>
                );
              })}
              <td className="admin-act">
                <div className="inline-flex justify-end gap-1 max-[760px]:flex-wrap">
                  <AdminButton variant="ghost" size="sm" onClick={() => openEdit(item)}>
                    Sửa
                  </AdminButton>
                  <AdminButton variant="ghost" size="sm" danger onClick={() => remove(item)}>
                    Xóa
                  </AdminButton>
                </div>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={config.columns.length + 1} className="admin-empty">
                Chưa có {config.singular} nào.
              </td>
            </tr>
          )}
        </tbody>
      </AdminTable>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 min-[761px]:items-center min-[761px]:p-4">
          <AdminPanel
            role="dialog"
            aria-labelledby={titleId}
            className="max-h-[calc(100dvh-1rem)] w-full max-w-md overflow-y-auto rounded-b-none p-6 min-[761px]:rounded-b-xl"
          >
            <h2 id={titleId} className="text-lg">
              {editing ? `Sửa ${config.singular}` : `Thêm ${config.singular}`}
            </h2>
            <form onSubmit={submit} className="mt-4 space-y-4">
              {config.fields.map((f) => {
                if (f.type === "hidden") return null;
                const fieldId = `${uid}-${f.key}`;
                const set = (v: string) => setFormData((d) => ({ ...d, [f.key]: v }));
                // country và mappos là điều khiển tự dựng, đã có nhãn truy cập riêng (aria-label), nên tên
                // trường chỉ là đoạn chữ; các loại còn lại là phần tử form thật nên nối bằng <Label htmlFor>.
                const standalone =
                  f.type === "country" || f.type === "mappos" || f.type === "image";
                return (
                  <div key={f.key} className="space-y-1.5">
                    {standalone ? (
                      f.type === "image" ? null : (
                        <p className="text-sm leading-none font-medium">{f.label}</p>
                      )
                    ) : (
                      <Label htmlFor={fieldId}>{f.label}</Label>
                    )}
                    {f.type === "select" ? (
                      <AdminSelect
                        id={fieldId}
                        value={formData[f.key] ?? ""}
                        onChange={(e) => set(e.target.value)}
                      >
                        <option value="">— chọn —</option>
                        {f.options?.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </AdminSelect>
                    ) : f.type === "textarea" ? (
                      <AdminTextarea
                        id={fieldId}
                        value={formData[f.key] ?? ""}
                        onChange={(e) => set(e.target.value)}
                      />
                    ) : f.type === "country" ? (
                      <>
                        <CountryCombobox
                          code={formData.code ?? ""}
                          name={formData[f.key] ?? ""}
                          onSelect={(c) =>
                            setFormData((d) => ({
                              ...d,
                              [f.key]: c.name,
                              code: c.code,
                              pos: c.pos,
                            }))
                          }
                        />
                        {/* Chọn nước thì điền sẵn tên từ danh sách; admin sửa lại được ở ô này (D18). */}
                        <div className="space-y-1.5 pt-2">
                          <Label htmlFor={`${fieldId}-display`}>Tên hiển thị trên website</Label>
                          <AdminInput
                            id={`${fieldId}-display`}
                            value={formData[f.key] ?? ""}
                            onChange={(e) => set(e.target.value)}
                          />
                        </div>
                      </>
                    ) : f.type === "mappos" ? (
                      <MapPositionPicker
                        value={formData[f.key] || "50,50"}
                        onChange={(next) =>
                          setFormData((d) => ({ ...d, [f.key]: next }))
                        }
                      />
                    ) : f.type === "image" ? (
                      <ImageField
                        label={f.label}
                        value={formData[f.key] ?? ""}
                        onChange={(url) => set(url ?? "")}
                        imageOnly
                        hint={imageHintFor("product-list", null, "image")}
                      />
                    ) : f.type === "number" ? (
                      <AdminInput
                        id={fieldId}
                        type="number"
                        min={0}
                        max={9999}
                        step={1}
                        inputMode="numeric"
                        value={formData[f.key] ?? ""}
                        onChange={(e) => set(e.target.value)}
                      />
                    ) : (
                      <AdminInput
                        id={fieldId}
                        value={formData[f.key] ?? ""}
                        onChange={(e) => set(e.target.value)}
                      />
                    )}
                  </div>
                );
              })}
              {error && <AdminNotice tone="danger">{error}</AdminNotice>}
              <div className="flex justify-end gap-2 pt-2">
                <AdminButton type="button" variant="ghost" onClick={() => setFormOpen(false)}>
                  Hủy
                </AdminButton>
                <AdminButton type="submit">Lưu</AdminButton>
              </div>
            </form>
          </AdminPanel>
        </div>
      )}
    </AdminPage>
  );
}
