"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link, usePathname } from "@/i18n/navigation";
import { locales } from "@/lib/i18n/config";
import { LOGO_URL } from "@/lib/site/business";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", key: "home" },
  { href: "/about", key: "about" },
  { href: "/careers", key: "careers" },
  { href: "/news", key: "news" },
  { href: "/contact", key: "contact" },
] as const;

const toolButton =
  "flex h-11 w-11 items-center justify-center rounded-[11px] border border-[color:var(--vcb-line-strong)] bg-[var(--vcb-panel)] text-foreground transition-colors";

function isActive(pathname: string, href: string) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const t = useTranslations("Header");
  const lang = useLocale();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 w-full border-b border-[color:var(--vcb-line-strong)] bg-[var(--vcb-panel)] shadow-[0_20px_70px_-44px_rgba(0,0,0,.55),inset_0_1px_0_rgba(255,255,255,.12)] transition-shadow duration-300",
        isScrolled && "shadow-md"
      )}
    >
      <div
        aria-hidden
        className="absolute inset-x-0 -bottom-px h-px bg-[linear-gradient(90deg,transparent,var(--vcb-gold),var(--tech-cyan),transparent)] opacity-55"
      />

      <div
        className={cn(
          "mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-2 transition-[min-height] duration-300 min-[880px]:px-6",
          isScrolled
            ? "min-h-[64px] min-[880px]:min-h-[76px]"
            : "min-h-[72px] min-[880px]:min-h-[88px]"
        )}
      >
        <Link href="/" className="flex items-center">
          <Image
            src={LOGO_URL}
            alt={t("logoAlt")}
            width={64}
            height={64}
            preload
            className={cn(
              "h-12 w-auto transition-[height] duration-300",
              isScrolled ? "min-[880px]:h-14" : "min-[880px]:h-16"
            )}
          />
        </Link>

        <nav
          aria-label={t("primaryNav")}
          className="hidden items-center gap-1 min-[880px]:flex min-[1100px]:gap-2"
        >
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative px-3 py-2 text-[0.9375rem] font-medium tracking-[0.01em] transition-colors min-[1100px]:px-4 min-[1100px]:text-[1.0625rem]",
                  active
                    ? "text-[color:var(--vcb-gold)] after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-[var(--vcb-gold)] min-[1100px]:after:inset-x-4"
                    : "text-foreground hover:text-[color:var(--vcb-gold)]"
                )}
              >
                {t(`nav.${item.key}`)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <nav
            aria-label={t("language")}
            className="flex h-11 items-center overflow-hidden rounded-[11px] border border-[color:var(--vcb-line-strong)] bg-[var(--vcb-panel)] text-[0.9375rem] font-medium"
          >
            {locales.map((code) => (
              <Link
                key={code}
                href={pathname}
                locale={code}
                hrefLang={code}
                lang={code}
                aria-current={code === lang ? "true" : undefined}
                className={cn(
                  "flex h-full items-center px-3 uppercase transition-colors",
                  code === lang
                    ? "bg-[var(--vcb-gold-soft)] text-[color:var(--vcb-gold)]"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {code}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={() =>
              setTheme(resolvedTheme === "light" ? "dark" : "light")
            }
            aria-label={t("themeToggle")}
            title={t("themeToggle")}
            className={toolButton}
          >
            {/* Đổi icon bằng CSS theo data-theme để không lệch giữa server và client. */}
            <Sun size={20} className="[html[data-theme=light]_&]:hidden" />
            <Moon
              size={20}
              className="hidden [html[data-theme=light]_&]:block"
            />
          </button>

          {/* Sheet điều khiển bằng state: bấm liên kết thì đóng menu, liên kết vẫn là <a> thường. */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger
              aria-label={t("openMenu")}
              className={cn(toolButton, "min-[880px]:hidden")}
            >
              <Menu size={20} />
            </SheetTrigger>
            {/* Tắt nút đóng mặc định (chữ "Close" gõ cứng) và tắt trượt khi người dùng bật reduced-motion. */}
            <SheetContent
              side="right"
              showCloseButton={false}
              className="motion-reduce:transition-none"
            >
              <SheetHeader>
                <SheetTitle>{t("menuTitle")}</SheetTitle>
              </SheetHeader>
              <SheetClose
                aria-label={t("close")}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
              >
                <X size={16} aria-hidden />
              </SheetClose>
              <nav
                aria-label={t("primaryNav")}
                className="flex flex-col gap-1 px-4 pb-4"
              >
                {NAV_ITEMS.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "rounded-[8px] px-3 py-3 text-[1.0625rem] font-medium",
                        active
                          ? "bg-[var(--vcb-gold-soft)] text-[color:var(--vcb-gold)]"
                          : "text-foreground"
                      )}
                    >
                      {t(`nav.${item.key}`)}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
