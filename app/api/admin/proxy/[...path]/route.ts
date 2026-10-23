import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { API_BASE } from "@/lib/api/config";
import { tagsForAdminWrite } from "@/lib/api/tags";
import {
  ADMIN_REFRESH_COOKIE,
  ADMIN_TOKEN_COOKIE,
  applySessionCookies,
} from "@/lib/admin/auth/cookies";
import { refreshSession, type RefreshedSession } from "@/lib/admin/auth/refresh";
import { isSameOriginRequest } from "@/lib/admin/auth/same-origin";

async function proxy(req: NextRequest, path: string[]) {
  // Ghi dữ liệu chỉ nhận request từ chính site (xem lib/admin/auth/same-origin.ts); GET/HEAD chỉ đọc nên không cần.
  if (!["GET", "HEAD"].includes(req.method) && !isSameOriginRequest(req.headers)) {
    return NextResponse.json({ message: "Yêu cầu không hợp lệ" }, { status: 403 });
  }

  const jar = await cookies();
  const token = jar.get(ADMIN_TOKEN_COOKIE)?.value;
  const refreshToken = jar.get(ADMIN_REFRESH_COOKIE)?.value;
  if (!token && !refreshToken) {
    return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
  }

  const url = `${API_BASE}/${path.join("/")}${req.nextUrl.search}`;
  const hasBody = !["GET", "HEAD"].includes(req.method);
  // Đọc thân yêu cầu một lần để có thể gửi lại sau khi refresh.
  const body = hasBody ? await req.arrayBuffer() : undefined;
  const contentType = req.headers.get("content-type") ?? "application/json";

  const send = (accessToken: string) =>
    fetch(url, {
      method: req.method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(hasBody ? { "Content-Type": contentType } : {}),
      },
      body,
    });

  let renewed: RefreshedSession | null = null;
  let res: Response | null = token ? await send(token) : null;
  // Access token thiếu hoặc hết hạn: refresh một lần rồi gửi lại đúng yêu cầu cũ.
  if ((res === null || res.status === 401) && refreshToken) {
    renewed = await refreshSession(refreshToken);
    if (renewed) res = await send(renewed.accessToken);
  }
  if (res === null) {
    return NextResponse.json({ message: "Chưa đăng nhập" }, { status: 401 });
  }

  // Ghi thành công thì xóa cache dữ liệu public liên quan để site hiện ngay (không đợi hết 60 giây).
  if (res.ok) {
    for (const tag of tagsForAdminWrite(req.method, path)) {
      revalidateTag(tag, { expire: 0 });
    }
  }

  const data = await res.arrayBuffer();
  const response = new NextResponse(data, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
  });
  if (renewed) applySessionCookies(response.cookies, renewed);
  return response;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, (await params).path);
}
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, (await params).path);
}
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, (await params).path);
}
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, (await params).path);
}
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, (await params).path);
}
