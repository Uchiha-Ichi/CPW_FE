import type { Metadata } from "next";
import "../globals.css";
import "./admin.css";
import { htmlClassName } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Viễn Chí Bảo",
  description: "Viễn Chí Bảo",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Admin chỉ có theme sáng. Đặt ở <html> (không phải một div) để portal (combobox, sheet) cũng sáng.
    // data-admin bật token và luật riêng trong admin.css.
    <html
      lang="vi"
      className={htmlClassName}
      data-theme="light"
      data-admin
      suppressHydrationWarning
    >
      <body className="flex flex-col font-body">{children}</body>
    </html>
  );
}
