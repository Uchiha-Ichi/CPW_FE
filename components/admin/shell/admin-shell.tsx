"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AdminSidebar } from "@/components/admin/shell/admin-sidebar";
import { AdminLogo } from "@/components/admin/ui/admin-logo";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Khung admin: sidebar dính từ 761px; ≤760px là thanh trên cùng + menu trượt từ phải (ui/sheet).
// Chỉ lo bố cục. Kiểm phiên (cookie, getAdminAccess) nằm ở layout (protected), không đưa vào đây.
export function AdminShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-background text-foreground min-[761px]:grid min-[761px]:grid-cols-[252px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh self-start overflow-y-auto border-r border-[color:var(--admin-line)] bg-card min-[761px]:block">
        <AdminSidebar />
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[color:var(--admin-line)] bg-card px-4 py-2 min-[761px]:hidden">
          {/* Chỉ hoa: logo đầy đủ ở w-28 cao ~100px, quá cao cho một thanh trên cùng. */}
          <AdminLogo variant="mark" className="w-10" />
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger
              aria-label="Mở menu"
              className="grid size-11 place-items-center rounded-lg border border-[color:var(--admin-field-border)] bg-card text-foreground"
            >
              <Menu className="size-5" aria-hidden />
            </SheetTrigger>
            {/* Tắt nút đóng mặc định (chữ "Close" gõ cứng) và tắt trượt khi bật reduced-motion. */}
            <SheetContent
              side="right"
              showCloseButton={false}
              className="gap-0 p-0 motion-reduce:transition-none data-[side=right]:w-[min(86vw,300px)]"
            >
              <SheetHeader className="sr-only">
                <SheetTitle>Điều hướng quản trị</SheetTitle>
              </SheetHeader>
              <SheetClose
                aria-label="Đóng"
                className="absolute right-3 top-3 grid size-11 place-items-center rounded-lg text-muted-foreground transition-colors hover:text-foreground motion-reduce:transition-none"
              >
                <X className="size-5" aria-hidden />
              </SheetClose>
              <AdminSidebar onNavigate={() => setMenuOpen(false)} />
            </SheetContent>
          </Sheet>
        </header>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
