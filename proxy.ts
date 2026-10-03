import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Chuyển đường dẫn chưa có tiền tố sang /vi hoặc /en theo Accept-Language (mặc định vi).
export default createMiddleware(routing);

export const config = {
  // Bỏ qua /admin, /api, /_next, /icon, /apple-icon và mọi đường dẫn có đuôi file (có dấu chấm).
  matcher: ["/((?!admin|api|trpc|_next|_vercel|icon|apple-icon|.*\\..*).*)"],
};
