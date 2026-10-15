import Link from "next/link";
import { AdminLogo } from "@/components/admin/ui/admin-logo";

// Hiện khi layout (protected) gọi notFound(). Nằm trong app/admin/layout.tsx nên không có <html>/<body>.
export default function AdminNotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-4 text-center font-body">
      <AdminLogo variant="full" className="mb-2 w-36" />
      <h1 className="admin-stat text-6xl">404</h1>
      <p className="text-muted-foreground">Không tìm thấy trang bạn cần.</p>
      <Link
        href="/"
        className="text-[color:var(--admin-brand-ink)] underline underline-offset-4"
      >
        Về trang chủ
      </Link>
    </div>
  );
}
