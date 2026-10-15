import { Be_Vietnam_Pro, Plus_Jakarta_Sans } from "next/font/google";
import { cn } from "@/lib/utils";

const bodyFont = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

// Variable font (200–800): không khai báo weight thì next/font tải cả dải độ đậm.
const displayFont = Plus_Jakarta_Sans({
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
