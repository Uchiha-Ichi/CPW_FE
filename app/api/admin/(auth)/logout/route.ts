import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/api/config";
import { ADMIN_REFRESH_COOKIE, clearSessionCookies } from "@/lib/admin/auth/cookies";
import { isSameOriginRequest } from "@/lib/admin/auth/same-origin";

export async function POST(req: NextRequest) {
  if (!isSameOriginRequest(req.headers)) {
    return NextResponse.json({ message: "Yêu cầu không hợp lệ" }, { status: 403 });
  }

  // Gọi backend thu hồi refresh token hash trong DB (refresh token gửi trong body). Không có refresh token
  // thì chỉ xóa cookie phía FE.
  const refreshToken = req.cookies.get(ADMIN_REFRESH_COOKIE)?.value;
  if (refreshToken) {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      signal: AbortSignal.timeout(5000),
    }).catch(() => {});
  }

  const response = NextResponse.json({ ok: true });
  // Xóa tất cả cookie phiên của FE (admin_token, admin_rt, admin_just_refreshed).
  clearSessionCookies(response.cookies);
  return response;
}
