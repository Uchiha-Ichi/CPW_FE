"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

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

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/proxy/applications");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
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

  if (loading) {
    return <p className="p-6 text-sm text-muted-foreground">Đang tải…</p>;
  }

  const groups = groupByPosition(items);

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-semibold">Hồ sơ ứng tuyển</h2>

      {groups.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Chưa có hồ sơ ứng tuyển nào.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {groups.map(([position, apps]) => {
            const isOpen = openPosition === position;
            return (
              <div key={position} className="overflow-hidden rounded-md border">
                <button
                  type="button"
                  className="flex w-full items-center justify-between p-3 text-left hover:bg-muted/50"
                  onClick={() => setOpenPosition(isOpen ? null : position)}
                >
                  <span className="font-medium">{position}</span>
                  <span className="text-sm text-muted-foreground">
                    {apps.length} ứng viên {isOpen ? "▲" : "▼"}
                  </span>
                </button>

                {isOpen && (
                  <div className="overflow-x-auto border-t">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="p-3 text-left font-medium">Ứng viên</th>
                          <th className="p-3 text-left font-medium">Liên hệ</th>
                          <th className="p-3 text-left font-medium">Giới thiệu</th>
                          <th className="p-3 text-left font-medium">CV</th>
                          <th className="p-3 text-left font-medium">Ngày nộp</th>
                          <th className="p-3 text-left font-medium">Trạng thái</th>
                          <th className="p-3 text-right font-medium">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {apps.map((app) => (
                          <tr key={app._id} className="border-b align-top last:border-0">
                            <td className="p-3">
                              <div className="font-medium">{app.name}</div>
                            </td>
                            <td className="p-3">
                              <div>{app.email}</div>
                              {app.phone && (
                                <div className="text-muted-foreground">{app.phone}</div>
                              )}
                              {app.portfolio && (
                                <a
                                  href={app.portfolio}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary underline"
                                >
                                  Portfolio
                                </a>
                              )}
                            </td>
                            <td className="max-w-[260px] p-3 text-muted-foreground">
                              {app.note}
                            </td>
                            <td className="p-3">
                              <a
                                href={app.cvUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary underline"
                              >
                                Xem CV
                              </a>
                            </td>
                            <td className="p-3 text-muted-foreground">
                              {new Date(app.createdAt).toLocaleDateString("vi-VN")}
                            </td>
                            <td className="p-3">
                              <select
                                className="rounded-md border p-1.5 text-sm"
                                value={app.status}
                                onChange={(e) => updateStatus(app._id, e.target.value)}
                              >
                                {STATUS_OPTIONS.map((s) => (
                                  <option key={s.value} value={s.value}>
                                    {s.label}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="p-3 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => remove(app)}
                              >
                                Xóa
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
