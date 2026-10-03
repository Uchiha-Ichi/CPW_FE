import Link from "next/link";

// Hiện khi layout (protected) gọi notFound(). Nằm trong app/admin/layout.tsx nên không có <html>/<body>.
export default function AdminNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center font-body">
      <h1 className="text-5xl font-bold leading-[1.12]">404</h1>
      <p className="text-muted-foreground">Không tìm thấy trang bạn cần.</p>
      <Link href="/" className="text-primary underline underline-offset-4">
        Về trang chủ
      </Link>
    </div>
  );
}
