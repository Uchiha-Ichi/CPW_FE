"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS: { href: string; label: string }[] = [
  { href: "/admin", label: "Tổng quan" },
  { href: "/admin/pages", label: "Nội dung trang" },
  { href: "/admin/news", label: "Tin tức" },
  { href: "/admin/products", label: "Sản phẩm" },
  { href: "/admin/jobs", label: "Tuyển dụng" },
  { href: "/admin/photos", label: "Thư viện ảnh" },
  { href: "/admin/network", label: "Bản đồ quốc gia" },
  { href: "/admin/team", label: "Đội ngũ" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="w-56 shrink-0 border-r p-4">
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-md px-3 py-2 text-sm ${
              pathname === item.href
                ? "bg-muted font-medium"
                : "text-muted-foreground hover:bg-muted/50"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <button
        type="button"
        onClick={logout}
        className="mt-6 w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted/50"
      >
        Đăng xuất
      </button>
    </aside>
  );
}
