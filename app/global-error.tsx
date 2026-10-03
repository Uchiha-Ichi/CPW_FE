"use client";

import "./globals.css";
import { htmlClassName } from "@/lib/fonts";

export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="vi" className={htmlClassName}>
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center font-body">
        <h1 className="text-3xl font-bold leading-[1.12]">Đã có lỗi xảy ra</h1>
        <p className="text-muted-foreground">Không thể hiển thị trang này. Vui lòng thử lại sau ít phút.</p>
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background"
        >
          Thử lại
        </button>
      </body>
    </html>
  );
}
