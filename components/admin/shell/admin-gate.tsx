"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminNotice } from "@/components/admin/ui/admin-notice";
import { getAdminAccess } from "@/lib/admin/auth/access";

type GateState = "checking" | "admin" | "forbidden" | "unavailable";

function FullScreen({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">{children}</div>
  );
}

// Cửa vào khu quản trị, chạy trên trình duyệt: hỏi backend người đang đăng nhập là ai rồi mới hiện trang.
// Đây chỉ là lớp hiển thị; bảo mật thật nằm ở backend (mọi API admin đều kiểm cookie phiên và quyền admin).
// Chưa đăng nhập (kể cả gia hạn phiên không được) thì chuyển về /admin/login.
export function AdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<GateState>("checking");

  useEffect(() => {
    let active = true;
    void getAdminAccess().then((access) => {
      if (!active) return;
      if (access.status === "unauthenticated") router.replace("/admin/login");
      else setState(access.status);
    });
    return () => {
      active = false;
    };
  }, [router]);

  if (state === "admin") return <>{children}</>;

  if (state === "forbidden") {
    return (
      <FullScreen>
        <AdminNotice tone="danger" className="max-w-md text-center">
          Tài khoản này không có quyền truy cập trang quản trị.
        </AdminNotice>
      </FullScreen>
    );
  }

  // Không xác nhận được quyền (backend tắt/lỗi): không cho vào, nói rõ lý do.
  if (state === "unavailable") {
    return (
      <FullScreen>
        <AdminNotice tone="danger" className="max-w-md text-center">
          Không kiểm tra được quyền truy cập quản trị. Vui lòng tải lại trang sau ít phút.
        </AdminNotice>
      </FullScreen>
    );
  }

  return (
    <FullScreen>
      <p role="status" className="text-sm text-muted-foreground">
        Đang xác thực phiên đăng nhập…
      </p>
    </FullScreen>
  );
}
