import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "ok" | "warn" | "muted";

const TONE: Record<Tone, string> = {
  ok: "bg-[color:var(--admin-ok-soft)] text-[color:var(--admin-ok)]",
  warn: "bg-[color:var(--admin-warn-soft)] text-[color:var(--admin-warn)]",
  muted: "bg-muted text-muted-foreground",
};

// Chấm màu kèm chữ: trạng thái không bao giờ chỉ dựa vào màu.
export function StatusChip({
  tone,
  className,
  children,
  ...props
}: React.ComponentProps<"span"> & { tone: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        TONE[tone],
        className,
      )}
      {...props}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
