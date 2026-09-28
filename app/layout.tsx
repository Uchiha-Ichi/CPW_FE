import type { Metadata } from "next";
import { Inter, Fraunces, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const bodyFont = Inter({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const displayFont = Fraunces({
  subsets: ["vietnamese", "latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Viễn Chí Bảo",
  description: "Viễn Chí Bảo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={cn(
        "h-full",
        "antialiased",
        bodyFont.variable,
        displayFont.variable,
        "font-sans",
        geist.variable
      )}
    >
      <body className="min-h-full flex flex-col font-body">{children}</body>
    </html>
  );
}
