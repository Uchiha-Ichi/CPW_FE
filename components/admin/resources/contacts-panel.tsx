"use client";

import { useEffect, useState } from "react";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminNotice } from "@/components/admin/ui/admin-notice";
import { AdminPage } from "@/components/admin/ui/admin-page";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminSelect } from "@/components/admin/ui/admin-select";
import { AdminTable } from "@/components/admin/ui/admin-table";
import { errorMessages } from "@/lib/admin/api-error";
import { deleteContact, listContacts, updateContactStatus } from "@/lib/admin/resources/api";
import { cn } from "@/lib/utils";

// Khớp schema Contact ở backend (cpw_be/src/contacts/schemas/contact.schema.ts).
type Contact = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: string;
  createdAt: string;
};

// Khớp CONTACT_STATUSES ở backend.
const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "new", label: "Mới" },
  { value: "read", label: "Đã đọc" },
  { value: "processing", label: "Đang xử lý" },
  { value: "replied", label: "Đã trả lời" },
  { value: "spam", label: "Spam" },
];

const LINK = "text-[color:var(--admin-brand-ink)] underline underline-offset-2";

// message do form Liên hệ ghép: "Chủ đề: …", có thể thêm dòng công ty/vị trí, một dòng trống rồi nội dung
// (lib/contact/message.ts). Dài hơn 3 dòng thì mặc định thu gọn, có nút xem đủ.
function isLong(message: string): boolean {
  return message.length > 160 || message.split("\n").length > 3;
}

export function ContactsPanel() {
  const [items, setItems] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Tải lại sau khi xóa.
  async function load() {
    setLoading(true);
    try {
      setItems(await listContacts<Contact>());
      setError(null);
    } catch (err) {
      setError(errorMessages(err).join(" "));
    }
    setLoading(false);
  }

  // Lần tải đầu: loading đã là true từ useState nên không gọi setLoading(true); setState nằm trong callback của promise.
  useEffect(() => {
    let cancelled = false;
    listContacts<Contact>()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessages(err).join(" "));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function updateStatus(id: string, status: string) {
    // Cập nhật lạc quan trước, gọi API sau — đổi trạng thái không cần chờ tải lại cả danh sách.
    const previous = items.find((it) => it._id === id)?.status;
    setItems((prev) => prev.map((it) => (it._id === id ? { ...it, status } : it)));
    try {
      await updateContactStatus(id, status);
      setError(null);
    } catch (err) {
      // Hoàn tác, trừ khi admin đã chọn trạng thái khác trong lúc chờ.
      setItems((prev) =>
        prev.map((it) =>
          it._id === id && it.status === status && previous !== undefined
            ? { ...it, status: previous }
            : it,
        ),
      );
      setError(errorMessages(err).join(" "));
    }
  }

  async function remove(item: Contact) {
    if (!confirm(`Xóa tin nhắn của "${item.name}"?`)) return;
    try {
      await deleteContact(item._id);
    } catch (err) {
      setError(errorMessages(err).join(" "));
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
        title="Khách liên hệ"
        description="Tin nhắn khách gửi từ form trang Liên hệ, mới nhất ở trên."
      />

      {error && (
        <AdminNotice tone="danger" className="mb-4">
          {error}
        </AdminNotice>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có tin nhắn liên hệ nào.</p>
      ) : (
        <AdminTable>
          <thead>
            <tr>
              <th>Người gửi</th>
              <th>Liên hệ</th>
              <th>Nội dung</th>
              <th>Ngày gửi</th>
              <th>Trạng thái</th>
              <th className="admin-act">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const long = isLong(item.message);
              const open = expanded.has(item._id);
              return (
                <tr key={item._id} className="align-top">
                  <td>
                    <div className="font-medium">{item.name}</div>
                  </td>
                  <td data-label="Liên hệ">
                    <a href={`mailto:${item.email}`} className={cn(LINK, "break-all")}>
                      {item.email}
                    </a>
                    {item.phone && <div className="text-muted-foreground">{item.phone}</div>}
                  </td>
                  <td data-label="Nội dung" className="min-w-[240px] max-w-[420px]">
                    <p
                      className={cn(
                        "whitespace-pre-line break-words",
                        long && !open && "line-clamp-3",
                      )}
                    >
                      {item.message}
                    </p>
                    {long && (
                      <button
                        type="button"
                        aria-expanded={open}
                        className={cn(LINK, "mt-1 text-sm")}
                        onClick={() => toggle(item._id)}
                      >
                        {open ? "Thu gọn" : "Xem đủ"}
                      </button>
                    )}
                  </td>
                  <td data-label="Ngày gửi" className="whitespace-nowrap text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString("vi-VN", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                  <td data-label="Trạng thái">
                    <AdminSelect
                      className="h-9 w-auto min-w-36"
                      aria-label={`Trạng thái tin nhắn của ${item.name}`}
                      value={item.status}
                      onChange={(e) => updateStatus(item._id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </AdminSelect>
                  </td>
                  <td className="admin-act">
                    <AdminButton variant="ghost" size="sm" danger onClick={() => remove(item)}>
                      Xóa
                    </AdminButton>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </AdminTable>
      )}
    </AdminPage>
  );
}
