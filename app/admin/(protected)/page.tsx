"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ADMIN_NAV_ITEMS } from "@/components/admin/shell/admin-nav-items";
import { AdminPage } from "@/components/admin/ui/admin-page";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminPanel } from "@/components/admin/ui/admin-panel";
import { adminFetch } from "@/lib/admin/auth/client";

// href và icon lấy từ ADMIN_NAV_ITEMS theo đường dẫn trang, để thẻ trỏ đúng mục menu tương ứng.
const COLLECTIONS: { path: string; label: string; href: string }[] = [
  // Backend không có GET /pages (404 → luôn ra 0). Danh sách trang nằm trong `pages` của block-types.
  { path: "/pages/block-types", label: "Nội dung trang", href: "/admin/pages" },
  { path: "/posts/admin?limit=1", label: "Tin tức", href: "/admin/news" },
  { path: "/products", label: "Sản phẩm", href: "/admin/products" },
  { path: "/jobs", label: "Tuyển dụng", href: "/admin/jobs" },
  { path: "/network", label: "Bản đồ quốc gia", href: "/admin/network" },
];

// Chạy trên trình duyệt: cookie phiên do backend giữ, server Next không đọc được (và không cần đọc).
async function countFor(path: string): Promise<number> {
  try {
    const res = await adminFetch(path, { cache: "no-store" });
    if (!res.ok) return 0;
    const data = await res.json();
    if (Array.isArray(data)) return data.length;
    if (data && typeof data.total === "number") return data.total;
    if (data && Array.isArray(data.pages)) return data.pages.length;
    return 0;
  } catch {
    return 0;
  }
}

export default function AdminOverviewPage() {
  const [counts, setCounts] = useState<number[] | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.all(COLLECTIONS.map((c) => countFor(c.path))).then((result) => {
      if (active) setCounts(result);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <AdminPage>
      <AdminPageHeader title="Tổng quan" />
      <ul className="grid grid-cols-2 gap-4 xl:grid-cols-3" aria-busy={counts === null}>
        {COLLECTIONS.map((c, i) => {
          const Icon = ADMIN_NAV_ITEMS.find((n) => n.href === c.href)?.icon;
          return (
            <li key={c.path}>
              <Link
                href={c.href}
                className="group block rounded-xl transition-shadow hover:shadow-md motion-reduce:transition-none"
              >
                <AdminPanel
                  tone="brand"
                  className="p-5 transition-colors group-hover:border-[color:var(--admin-brand-strong)] motion-reduce:transition-none"
                >
                  {Icon && (
                    <Icon
                      className="mb-4 size-5 text-[color:var(--admin-brand-ink)]"
                      aria-hidden
                    />
                  )}
                  <p className="admin-stat text-4xl">{counts ? counts[i] : "–"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{c.label}</p>
                </AdminPanel>
              </Link>
            </li>
          );
        })}
      </ul>
    </AdminPage>
  );
}
