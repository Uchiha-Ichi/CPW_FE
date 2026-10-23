import { API_BASE } from "@/lib/api/config";

export type AdminAccess =
  | { status: "admin" }
  | { status: "unauthenticated" }
  | { status: "forbidden" }
  | { status: "unavailable" };

// Giá trị của ROLE.ADMIN ở backend (cpw_be/src/common/enum.ts).
const ADMIN_ROLE = "admin";

// Hỏi backend người đang giữ token là ai. Không bao giờ ném lỗi; mọi trường hợp không chắc
// chắn trả "unavailable" (đóng), không bao giờ trả "admin".
export async function getAdminAccess(token: string): Promise<AdminAccess> {
  try {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      // Backend treo thì sau 5 giây cho kết quả "unavailable" (lỗi abort rơi vào catch bên dưới).
      signal: AbortSignal.timeout(5000),
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
