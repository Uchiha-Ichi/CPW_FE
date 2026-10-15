"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ExternalLink, LogOut } from "lucide-react";
import { ADMIN_NAV_ITEMS, isNavActive } from "@/components/admin/admin-nav-items";
import { AdminLogo } from "@/components/admin/ui/admin-logo";
import { cn } from "@/lib/utils";

const ITEM =
  "flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors motion-reduce:transition-none";
const ITEM_IDLE =
  "text-muted-foreground hover:bg-muted hover:text-foreground";

export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Điều hướng quản trị" className="flex flex-col gap-1">
      {ADMIN_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = isNavActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              ITEM,
              active
                ? "bg-[color:var(--admin-brand-soft)] font-semibold text-[color:var(--admin-brand-ink)]"
                : ITEM_IDLE,
            )}
          >
            <Icon className="size-[18px] shrink-0" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

// Cột menu đầy đủ: dùng cho sidebar (từ 761px) và trong Sheet (điện thoại).
export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="px-2 pt-1">
        <AdminLogo className="w-40" />
      </div>
      <AdminNav onNavigate={onNavigate} />
      <div className="mt-auto flex flex-col gap-1 border-t border-[color:var(--admin-line)] pt-3">
        <a
          href="/vi"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(ITEM, ITEM_IDLE)}
        >
          <ExternalLink className="size-[18px] shrink-0" aria-hidden />
          Xem website
        </a>
        <button type="button" onClick={logout} className={cn(ITEM, ITEM_IDLE)}>
          <LogOut className="size-[18px] shrink-0" aria-hidden />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
