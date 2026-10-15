import * as React from "react";
import { cn } from "@/lib/utils";

const WIDTH = {
  default: "max-w-[1080px]",
  narrow: "max-w-2xl",
  wide: "max-w-[1440px]",
} as const;

// Khung nội dung của một trang admin: padding và bề rộng tối đa, thay cho `div.p-6` lặp ở từng trang.
// Lề ngang đặt thành biến --admin-gutter để thanh dính tràn mép (page-editor) dùng `-mx-[var(--admin-gutter)]`.
export function AdminPage({
  width = "default",
  className,
  ...props
}: React.ComponentProps<"div"> & { width?: keyof typeof WIDTH }) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-[var(--admin-gutter)] py-8 [--admin-gutter:clamp(16px,3vw,40px)] max-[760px]:py-6",
        WIDTH[width],
        className,
      )}
      {...props}
    />
  );
}
