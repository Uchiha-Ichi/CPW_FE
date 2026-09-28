"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV_LINKS = [
  { href: "/", label: "Trang chủ" },
  { href: "/about", label: "Về chúng tôi" },
  { href: "/careers", label: "Tuyển dụng" },
  { href: "/news", label: "Tin tức" },
  { href: "/contact", label: "Liên hệ" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="w-full sticky top-0 z-50 border-b bg-[--header-bg] backdrop-blur-[10px]"
      style={{ height: "var(--header-height)" }}
    >
      <div className="mx-auto flex h-full max-w-none items-center justify-between px-4">
        <Link href="/" className="font-semibold text-lg flex items-center gap-2">
          Viễn Chí Bảo
        </Link>

        <nav className="hidden items-center gap-6 min-[880px]:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-[0.93rem] text-muted-foreground hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 min-[880px]:hidden">
          <Button variant="ghost" size="sm">
            VI
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Mở menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="mt-8 flex flex-col gap-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-[0.98rem] text-muted-foreground border-b pb-2"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
