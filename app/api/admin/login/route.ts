import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/api/config";
import {
  BACKEND_ACCESS_COOKIE,
  BACKEND_REFRESH_COOKIE,
  parseSetCookie,
} from "@/lib/admin/auth-cookies";
import { applySessionCookies } from "@/lib/admin/session-cookies";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({ message: "Đăng nhập thất bại" }));
    return NextResponse.json(err, { status: res.status });
  }

  const data = await res.json();

  // vcb-api mới set token qua HttpOnly cookie "crmspd_at" thay vì body.accessToken
  // Lấy access token từ Set-Cookie headers để set lại thành "admin_token" (tên FE đang dùng)
  const setCookies = res.headers.getSetCookie?.() ?? [];
  let accessToken = parseSetCookie(setCookies, BACKEND_ACCESS_COOKIE)?.value ?? null;

  // Fallback: API cũ vẫn trả accessToken trong body
  if (!accessToken && data.accessToken) {
    accessToken = data.accessToken as string;
  }

  if (!accessToken) {
    return NextResponse.json({ message: "Đăng nhập thất bại" }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true, user: data.user });

  // admin_token cho layout guard và proxy (Bearer); admin_rt (refresh token) để tự gia hạn phiên.
  const refresh = parseSetCookie(setCookies, BACKEND_REFRESH_COOKIE);
  applySessionCookies(response.cookies, {
    accessToken,
    refreshToken: refresh?.value ?? null,
    refreshMaxAge: refresh?.maxAge ?? null,
  });

  // Forward các cookies gốc từ API (crmspd_rt, crmspd_csrf) như trước.
  for (const cookie of setCookies) {
    if (!cookie.startsWith("crmspd_at")) {
      response.headers.append("Set-Cookie", cookie);
    }
  }

  return response;
}
