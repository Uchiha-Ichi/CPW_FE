import { NextRequest, NextResponse } from "next/server";
import { ADMIN_REFRESH_COOKIE } from "@/lib/admin/auth-cookies";
import { refreshSession } from "@/lib/admin/refresh";
import { applySessionCookies, clearSessionCookies } from "@/lib/admin/session-cookies";

// Layout admin chuyển tới đây khi access token hết hạn (Server Component không đặt được cookie).
// Luôn chuyển tới đường dẫn cố định, không nhận tham số đích (tránh open redirect).
export async function GET(req: NextRequest) {
  const refreshToken = req.cookies.get(ADMIN_REFRESH_COOKIE)?.value;
  const session = refreshToken ? await refreshSession(refreshToken) : null;

  const target = req.nextUrl.clone();
  target.pathname = session ? "/admin" : "/admin/login";
  target.search = "";
  const response = NextResponse.redirect(target);

  if (session) {
    applySessionCookies(response.cookies, session, { markRefreshed: true });
  } else {
    clearSessionCookies(response.cookies);
  }
  return response;
}
