import * as React from "react";
import { AdminPanel } from "@/components/admin/ui/admin-panel";
import { cn } from "@/lib/utils";

// Bảng dùng chung: panel + <table class="admin-table"> (luật CSS ở admin.css). Thay cho 3 bản <table>
// viết tay. ≤760px mỗi hàng thành một thẻ: ô nào cần nhãn thì đặt data-label="Tên cột".
// `bare`: bảng nằm trong một panel có sẵn (ví dụ accordion) nên không bọc thêm panel, tránh viền lồng viền.
export function AdminTable({
  bare = false,
  className,
  ...props
}: React.ComponentProps<"table"> & { bare?: boolean }) {
  const table = <table className={cn("admin-table", className)} {...props} />;
  if (bare) return <div className="overflow-x-auto">{table}</div>;
  return <AdminPanel className="overflow-x-auto">{table}</AdminPanel>;
}
