import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { forwardedClientIpHeaders } from "./lib/api/client-ip";

// Chuyển đường dẫn chưa có tiền tố sang /vi hoặc /en theo Accept-Language (mặc định vi).
const intl = createMiddleware(routing);

const LOGIN_PATH = "/api/auth/login";

export default function proxy(request: NextRequest) {
  // Đăng nhập đi qua rewrites (next.config.ts) sang backend; backend giới hạn số lần theo IP người dùng.
  // Domain backend ai cũng gọi thẳng được kèm X-Forwarded-For giả, nên backend chỉ tin IP gửi kèm khoá chung
  // FORWARDED_IP_SECRET (cpw_be/src/utils/client-ip.util.ts). Gắn ở đây: Proxy chạy trước rewrites và header
  // đặt bằng NextResponse.next({ request }) được chuyển sang đích rewrite. Không đọc hay đổi body, không đụng cookie.
  if (request.nextUrl.pathname === LOGIN_PATH) {
    const headers = new Headers(request.headers);
    for (const [name, value] of Object.entries(forwardedClientIpHeaders(request.headers))) {
      headers.set(name, value);
    }
    return NextResponse.next({ request: { headers } });
  }
  return intl(request);
}

export const config = {
  // Trang: bỏ qua /admin, /api, /_next, /icon, /apple-icon và mọi đường dẫn có đuôi file (có dấu chấm).
  // Riêng /api/auth/login chạy qua để gắn IP người dùng (xem trên).
  matcher: ["/((?!admin|api|_next|_vercel|icon|apple-icon|.*\\..*).*)", "/api/auth/login"],
};
