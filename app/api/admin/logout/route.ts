import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export async function POST(req: NextRequest) {
  const token = (await cookies()).get("admin_token")?.value;

  // Gọi vcb-api logout để thu hồi refresh token hash trong DB
  if (token) {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }

  const response = NextResponse.json({ ok: true });
  // Xóa tất cả auth cookies
  response.cookies.delete("admin_token");
  response.cookies.delete("crmspd_at");
  response.cookies.delete("crmspd_csrf");
  // crmspd_rt có path /api/auth riêng
  response.headers.append(
    "Set-Cookie",
    "crmspd_rt=; Path=/api/auth; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax"
  );
  return response;
}
