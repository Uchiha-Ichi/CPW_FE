import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "danger" | "info" | "ok";

// Lỗi dùng role="alert" (đọc ngay), còn lại role="status". Chỉ đổi role khi cần giữ đúng hành vi cũ.
const TONE: Record<Tone, { role: "alert" | "status"; className: string }> = {
  danger: {
    role: "alert",
    className:
      "border-[color:var(--admin-danger)]/40 bg-[color:var(--admin-danger-soft)] text-[color:var(--admin-danger)]",
  },
  info: {
    role: "status",
    className:
      "border-[color:var(--admin-line)] bg-[color:var(--admin-brand-soft)] text-[color:var(--admin-brand-ink)]",
  },
  ok: {
    role: "status",
    className:
      "border-[color:var(--admin-ok)]/40 bg-[color:var(--admin-ok-soft)] text-[color:var(--admin-ok)]",
  },
};

export function AdminNotice({
  tone,
  role,
  className,
  ...props
}: React.ComponentProps<"div"> & { tone: Tone }) {
  const t = TONE[tone];
  return (
    <div
      role={role ?? t.role}
      className={cn("rounded-lg border px-3 py-2.5 text-sm", t.className, className)}
      {...props}
    />
  );
}
