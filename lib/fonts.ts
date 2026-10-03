import { Inter, Fraunces } from "next/font/google";
import { cn } from "@/lib/utils";

const bodyFont = Inter({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const displayFont = Fraunces({
  subsets: ["vietnamese", "latin"],
  variable: "--font-display",
});

// Class cho thẻ <html> của cả site và admin (hai root layout dùng chung).
export const htmlClassName = cn(
  "antialiased",
  bodyFont.variable,
  displayFont.variable,
  "font-sans",
);
