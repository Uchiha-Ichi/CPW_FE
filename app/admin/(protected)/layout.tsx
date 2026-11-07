import { AdminGate } from "@/components/admin/shell/admin-gate";
import { AdminShell } from "@/components/admin/shell/admin-shell";

// Phiên đăng nhập do backend giữ trong cookie; server Next không đọc cookie nào. AdminGate hỏi backend trên
// trình duyệt rồi mới hiện khung admin (xem components/admin/shell/admin-gate.tsx).
export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGate>
      <AdminShell>{children}</AdminShell>
    </AdminGate>
  );
}
