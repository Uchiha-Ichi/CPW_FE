import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Bọc ui/card (dùng ở admin: news-composer-view, resource-table): viền mảnh, phẳng, bo 12px.
// `brand` thêm gradient xanh rất nhẹ, chỉ dùng ở nơi "trưng bày" (Tổng quan).
// Card gốc có padding dọc riêng: tắt (gap-0 py-0) để nơi dùng tự đặt padding.
export function AdminPanel({
  tone = "plain",
  className,
  ...props
}: React.ComponentProps<typeof Card> & { tone?: "plain" | "brand" }) {
  return (
    <Card
      className={cn(
        "gap-0 rounded-xl border border-[color:var(--admin-line)] bg-card py-0 ring-0",
        tone === "brand" &&
          "bg-linear-to-br from-[color:var(--admin-brand-soft)] to-card",
        className,
      )}
      {...props}
    />
  );
}
