"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { AdminPage } from "@/components/admin/ui/admin-page";
import { AdminPanel } from "@/components/admin/ui/admin-panel";
import { AdminSelect } from "@/components/admin/ui/admin-select";
import { AdminTable } from "@/components/admin/ui/admin-table";
import { cn } from "@/lib/utils";

type Application = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  position: string;
  portfolio?: string;
  cvUrl: string;
  note?: string;
  status: string;
  createdAt: string;
};

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "new", label: "Mới" },
  { value: "reviewing", label: "Đang xem xét" },
  { value: "interview", label: "Phỏng vấn" },
  { value: "rejected", label: "Từ chối" },
  { value: "hired", label: "Đã nhận" },
];

const LINK = "text-[color:var(--admin-brand-ink)] underline underline-offset-2";

function groupByPosition(items: Application[]): [string, Application[]][] {
  const map = new Map<string, Application[]>();
  for (const item of items) {
    const list = map.get(item.position) ?? [];
    list.push(item);
    map.set(item.position, list);
  }
  return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
}

export function ApplicationsPanel() {
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [openPosition, setOpenPosition] = useState<string | null>(null);

  // Tải lại sau khi xóa.
  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/proxy/applications");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }

  // Lần tải đầu: loading đã là true từ useState nên không gọi setLoading(true); setState nằm trong callback của promise.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/proxy/applications")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Application[] | null) => {
        if (!cancelled && data) setItems(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function updateStatus(id: string, status: string) {
    // Cập nhật lạc quan trước, gọi API sau — đổi trạng thái không cần chờ tải lại cả danh sách.
    setItems((prev) => prev.map((it) => (it._id === id ? { ...it, status } : it)));
    await fetch(`/api/admin/proxy/applications/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  async function remove(item: Application) {
    if (!confirm(`Xóa hồ sơ của "${item.name}"?`)) return;
    await fetch(`/api/admin/proxy/applications/${item._id}`, { method: "DELETE" });
    load();
  }

  // Nằm dưới bảng vị trí trên cùng một trang: dùng cùng AdminPage (bỏ padding trên) để hai khối thẳng cột.
  if (loading) {
    return (
      <AdminPage className="pt-0">
        <p className="text-sm text-muted-foreground">Đang tải…</p>
      </AdminPage>
    );
  }

  const groups = groupByPosition(items);

  return (
    <AdminPage className="pt-0">
      <h2 className="text-xl">Hồ sơ ứng tuyển</h2>

      {groups.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Chưa có hồ sơ ứng tuyển nào.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {groups.map(([position, apps]) => {
            const isOpen = openPosition === position;
            return (
              <AdminPanel key={position}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  className="flex min-h-11 w-full items-center justify-between gap-3 p-3 text-left transition-colors hover:bg-[color:var(--admin-brand-soft)] motion-reduce:transition-none"
                  onClick={() => setOpenPosition(isOpen ? null : position)}
                >
                  <span className="font-medium">{position}</span>
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    {apps.length} ứng viên
                    <ChevronDown
                      aria-hidden
                      className={cn(
                        "size-4 transition-transform motion-reduce:transition-none",
                        isOpen && "rotate-180",
                      )}
                    />
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-[color:var(--admin-line)]">
                    <AdminTable bare>
                      <thead>
                        <tr>
                          <th>Ứng viên</th>
                          <th>Liên hệ</th>
                          <th>Giới thiệu</th>
                          <th>CV</th>
                          <th>Ngày nộp</th>
                          <th>Trạng thái</th>
                          <th className="admin-act">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {apps.map((app) => (
                          <tr key={app._id} className="align-top">
                            <td>
                              <div className="font-medium">{app.name}</div>
                            </td>
                            <td data-label="Liên hệ">
                              <div>{app.email}</div>
                              {app.phone && (
                                <div className="text-muted-foreground">{app.phone}</div>
                              )}
                              {app.portfolio && (
                                <a
                                  href={app.portfolio}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={LINK}
                                >
                                  Portfolio
                                </a>
                              )}
                            </td>
                            <td data-label="Giới thiệu" className="max-w-[260px] text-muted-foreground">
                              {app.note}
                            </td>
                            <td data-label="CV" className="whitespace-nowrap">
                              <a
                                href={app.cvUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={LINK}
                              >
                                Xem CV
                              </a>
                            </td>
                            <td data-label="Ngày nộp" className="text-muted-foreground">
                              {new Date(app.createdAt).toLocaleDateString("vi-VN")}
                            </td>
                            <td data-label="Trạng thái">
                              <AdminSelect
                                className="h-9 w-auto min-w-36"
                                aria-label={`Trạng thái hồ sơ của ${app.name}`}
                                value={app.status}
                                onChange={(e) => updateStatus(app._id, e.target.value)}
                              >
                                {STATUS_OPTIONS.map((s) => (
                                  <option key={s.value} value={s.value}>
                                    {s.label}
                                  </option>
                                ))}
                              </AdminSelect>
                            </td>
                            <td className="admin-act">
                              <AdminButton
                                variant="ghost"
                                size="sm"
                                danger
                                onClick={() => remove(app)}
                              >
                                Xóa
                              </AdminButton>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </AdminTable>
                  </div>
                )}
              </AdminPanel>
            );
          })}
        </div>
      )}
    </AdminPage>
  );
}
