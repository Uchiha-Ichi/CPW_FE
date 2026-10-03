import type { Metadata } from "next";
import "../globals.css";
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
    <html lang="vi" className={htmlClassName}>
      <body className="flex flex-col font-body">{children}</body>
    </html>
  );
}
