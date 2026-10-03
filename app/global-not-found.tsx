import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";
import { htmlClassName } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "404 | Viễn Chí Bảo",
};

export default function GlobalNotFound() {
  return (
    <html lang="vi" className={htmlClassName}>
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center font-body">
        <h1 className="text-5xl font-bold leading-[1.12]">404</h1>
        <p className="text-muted-foreground">Không tìm thấy trang bạn cần.</p>
        <Link href="/" className="text-primary underline underline-offset-4">
          Về trang chủ
        </Link>
      </body>
    </html>
  );
}
