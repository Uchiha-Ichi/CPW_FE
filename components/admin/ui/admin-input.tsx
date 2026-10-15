import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Bọc ui/input (dùng chung với site): ô 40px (44px trên điện thoại), viền đạt 3:1 (WCAG 1.4.11).
// Không đặt cỡ chữ: ui/input đã dùng 16px trên điện thoại để iOS không tự phóng to khi focus.
export function AdminInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      className={cn(
        "h-10 rounded-lg border-[color:var(--admin-field-border)] bg-card px-3 max-[760px]:h-11",
        "focus-visible:border-[color:var(--admin-brand-strong)] focus-visible:ring-2 focus-visible:ring-[color:var(--admin-brand-strong)]/30",
        "aria-invalid:border-[color:var(--admin-danger)] aria-invalid:ring-[color:var(--admin-danger)]/20",
        className,
      )}
      {...props}
    />
  );
}
