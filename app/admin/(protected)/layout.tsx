import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/shell/admin-shell";
import { AdminNotice } from "@/components/admin/ui/admin-notice";
import { ADMIN_REFRESHED_COOKIE, ADMIN_TOKEN_COOKIE } from "@/lib/admin/auth/cookies";
import { getAdminAccess } from "@/lib/admin/auth/access";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jar = await cookies();
  const token = jar.get(ADMIN_TOKEN_COOKIE)?.value;
  // Vừa refresh xong mà vẫn 401 (cookie dấu còn sống 10 giây): đăng nhập lại, không vòng lặp.
  const needLogin = jar.has(ADMIN_REFRESHED_COOKIE) ? "/admin/login" : "/api/admin/refresh";

  // Thiếu token hoặc token hết hạn: thử gia hạn bằng refresh token (route refresh tự về
  // /admin/login nếu không gia hạn được).
  if (!token) {
    redirect(needLogin);
  }

  const access = await getAdminAccess(token);
  if (access.status === "unauthenticated") {
    redirect(needLogin);
  }
  // Đăng nhập được nhưng không phải admin: coi như trang không tồn tại.
  if (access.status === "forbidden") {
    notFound();
  }
  // Không xác nhận được quyền (backend tắt/lỗi): không cho vào, nói rõ lý do.
  if (access.status === "unavailable") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <AdminNotice tone="danger" className="max-w-md text-center">
          Không kiểm tra được quyền truy cập quản trị. Vui lòng tải lại trang sau ít phút.
        </AdminNotice>
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
