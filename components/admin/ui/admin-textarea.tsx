import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Bọc ui/textarea (dùng chung với site): cùng viền và vòng focus với AdminInput.
export function AdminTextarea({
  className,
  ...props
}: React.ComponentProps<typeof Textarea>) {
  return (
    <Textarea
      className={cn(
        "rounded-lg border-[color:var(--admin-field-border)] bg-card px-3",
        "focus-visible:border-[color:var(--admin-brand-strong)] focus-visible:ring-2 focus-visible:ring-[color:var(--admin-brand-strong)]/30",
        "aria-invalid:border-[color:var(--admin-danger)] aria-invalid:ring-[color:var(--admin-danger)]/20",
        className,
      )}
      {...props}
    />
  );
}
