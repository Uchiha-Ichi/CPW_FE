import * as React from "react";
import { cn } from "@/lib/utils";

// <select> native có style cùng ô nhập (không cài ui/select: đổi sang listbox tùy biến là đổi hành vi).
// 16px trên điện thoại để iOS không tự phóng to khi focus, giống ui/input.
export function AdminSelect({
  className,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-lg border border-[color:var(--admin-field-border)] bg-card px-3 text-base outline-none transition-colors md:text-sm max-[760px]:h-11",
        "focus-visible:border-[color:var(--admin-brand-strong)] focus-visible:ring-2 focus-visible:ring-[color:var(--admin-brand-strong)]/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
