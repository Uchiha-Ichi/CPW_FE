import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

/** Parse giá trị của cookie tên `name` từ một Set-Cookie header string */
function parseCookieValue(setCookieStr: string, name: string): string | null {
  for (const part of setCookieStr.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k.trim() === name) return v.join("=").trim();
  }
  return null;
}

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
  let accessToken: string | null = null;
  for (const c of setCookies) {
    const val = parseCookieValue(c, "crmspd_at");
    if (val) { accessToken = val; break; }
  }

  // Fallback: API cũ vẫn trả accessToken trong body
  if (!accessToken && data.accessToken) {
    accessToken = data.accessToken as string;
  }

  if (!accessToken) {
    return NextResponse.json({ message: "Đăng nhập thất bại" }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true, user: data.user });

  // Set admin_token để layout guard và proxy FE đọc được (Bearer strategy)
  response.cookies.set("admin_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  // Forward các cookies gốc từ API (crmspd_rt, crmspd_csrf) để refresh token hoạt động sau này
  for (const cookie of setCookies) {
    if (!cookie.startsWith("crmspd_at")) {
      response.headers.append("Set-Cookie", cookie);
    }
  }

  return response;
}
