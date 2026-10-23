import { cookies } from "next/headers";
import Link from "next/link";
import { ADMIN_NAV_ITEMS } from "@/components/admin/shell/admin-nav-items";
import { AdminPage } from "@/components/admin/ui/admin-page";
import { AdminPageHeader } from "@/components/admin/ui/admin-page-header";
import { AdminPanel } from "@/components/admin/ui/admin-panel";
import { API_BASE } from "@/lib/api/config";

// href và icon lấy từ ADMIN_NAV_ITEMS theo đường dẫn trang, để thẻ trỏ đúng mục menu tương ứng.
const COLLECTIONS: { path: string; label: string; href: string }[] = [
  // Backend không có GET /pages (404 → luôn ra 0). Danh sách trang nằm trong `pages` của block-types.
  { path: "pages/block-types", label: "Nội dung trang", href: "/admin/pages" },
  { path: "posts/admin?limit=1", label: "Tin tức", href: "/admin/news" },
  { path: "products", label: "Sản phẩm", href: "/admin/products" },
  { path: "jobs", label: "Tuyển dụng", href: "/admin/jobs" },
  { path: "network", label: "Bản đồ quốc gia", href: "/admin/network" },
];

async function countFor(path: string, token: string): Promise<number> {
  try {
    const res = await fetch(`${API_BASE}/${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
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

export default async function AdminOverviewPage() {
  const token = (await cookies()).get("admin_token")!.value;
  const counts = await Promise.all(
    COLLECTIONS.map((c) => countFor(c.path, token))
  );

  return (
    <AdminPage>
      <AdminPageHeader title="Tổng quan" />
      <ul className="grid grid-cols-2 gap-4 xl:grid-cols-3">
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
                  <p className="admin-stat text-4xl">{counts[i]}</p>
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
