import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE } from "@/lib/api/config";
import {
  ADMIN_REFRESH_COOKIE,
  ADMIN_TOKEN_COOKIE,
  BACKEND_REFRESH_COOKIE,
} from "@/lib/admin/auth-cookies";
import { clearSessionCookies } from "@/lib/admin/session-cookies";

export async function POST() {
  const jar = await cookies();
  const token = jar.get(ADMIN_TOKEN_COOKIE)?.value;
  const refreshToken = jar.get(ADMIN_REFRESH_COOKIE)?.value;

  // Gọi vcb-api logout để thu hồi refresh token hash trong DB. Backend đọc refresh token từ cookie
  // crmspd_rt nên phải gửi nó kèm; không có thì chỉ xóa cookie phía FE.
  if (token || refreshToken) {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(refreshToken ? { Cookie: `${BACKEND_REFRESH_COOKIE}=${refreshToken}` } : {}),
      },
      signal: AbortSignal.timeout(5000),
    }).catch(() => {});
  }

  const response = NextResponse.json({ ok: true });
  // Xóa tất cả cookie phiên của FE (admin_token, admin_rt, admin_just_refreshed).
  clearSessionCookies(response.cookies);
  // Cookie gốc của backend chuyển tiếp lúc đăng nhập.
  response.cookies.delete("crmspd_at");
  response.cookies.delete("crmspd_csrf");
  // crmspd_rt có path /api/auth riêng
  response.headers.append(
    "Set-Cookie",
    "crmspd_rt=; Path=/api/auth; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax"
  );
  return response;
}
