import { adminFetch } from "./client";

export type AdminAccess =
  | { status: "admin" }
  | { status: "unauthenticated" }
  | { status: "forbidden" }
  | { status: "unavailable" };

// Giá trị của ROLE.ADMIN ở backend (cpw_be/src/common/enum.ts).
const ADMIN_ROLE = "admin";

// Chạy trên trình duyệt: hỏi backend người đang đăng nhập là ai (cookie phiên tự gửi kèm, hết hạn thì
// adminFetch tự gia hạn một lần). Không bao giờ ném lỗi; mọi trường hợp không chắc chắn trả "unavailable"
// (đóng), không bao giờ trả "admin".
export async function getAdminAccess(): Promise<AdminAccess> {
  try {
    const res = await adminFetch("/auth/profile", {
      cache: "no-store",
      // Backend treo thì sau 10 giây cho kết quả "unavailable" (lỗi abort rơi vào catch bên dưới).
      signal: AbortSignal.timeout(10_000),
    });
    if (res.status === 401) return { status: "unauthenticated" };
    if (res.status === 403) return { status: "forbidden" };
    if (!res.ok) return { status: "unavailable" };

    const body: unknown = await res.json();
    if (typeof body !== "object" || body === null)
      return { status: "unavailable" };
    const { role, isActive } = body as { role?: unknown; isActive?: unknown };
    if (typeof role !== "string") return { status: "unavailable" };
    return role === ADMIN_ROLE && isActive !== false
      ? { status: "admin" }
      : { status: "forbidden" };
  } catch {
    return { status: "unavailable" };
  }
}
