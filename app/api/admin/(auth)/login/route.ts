import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/api/config";
import { readTokenResponse } from "@/lib/admin/auth/refresh";
import { isSameOriginRequest } from "@/lib/admin/auth/same-origin";
import { applySessionCookies } from "@/lib/admin/auth/cookies";
import { forwardedClientIpHeaders } from "@/lib/api/client-ip";

export async function POST(req: NextRequest) {
  if (!isSameOriginRequest(req.headers)) {
    return NextResponse.json({ message: "Yêu cầu không hợp lệ" }, { status: 403 });
  }

  const body: unknown = await req.json().catch(() => null);
  if (body === null) {
    return NextResponse.json({ message: "Dữ liệu đăng nhập không hợp lệ" }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      // Backend giới hạn số lần đăng nhập theo IP người dùng (không phải IP của server Next).
      headers: { "Content-Type": "application/json", ...forwardedClientIpHeaders(req.headers) },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    // Backend tắt hoặc treo: báo rõ thay vì để route ném lỗi 500 không có nội dung.
    return NextResponse.json(
      { message: "Không kết nối được máy chủ. Vui lòng thử lại sau ít phút." },
      { status: 503 },
    );
  }

  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({ message: "Đăng nhập thất bại" }));
    return NextResponse.json(err, { status: res.status });
  }

  // Backend trả token trong body ({ user, accessToken, refreshToken, refreshExpiresIn }), không đặt cookie.
  const data: unknown = await res.json().catch(() => null);
  const session = readTokenResponse(data);
  if (!session) {
    return NextResponse.json({ message: "Đăng nhập thất bại" }, { status: 502 });
  }

  const response = NextResponse.json({ ok: true, user: (data as { user?: unknown }).user });
  // admin_token cho layout guard và proxy (Bearer); admin_rt (refresh token) để tự gia hạn phiên.
  applySessionCookies(response.cookies, session);
  return response;
}
