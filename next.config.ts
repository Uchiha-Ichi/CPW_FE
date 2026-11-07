import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

// Địa chỉ backend, cùng biến server API_URL mà lib/api/config.ts đọc (không import file đó được: nó có
// "server-only"). Thiếu biến thì dừng, không đoán địa chỉ: bản build quên khai biến không được âm thầm gọi
// nhầm backend.
const apiUrl = process.env.API_URL?.trim().replace(/\/+$/, "");
if (!apiUrl) throw new Error("Missing environment variable: API_URL");

const nextConfig: NextConfig = {
  experimental: {
    globalNotFound: true,
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "flagcdn.com" }],
    formats: ["image/avif", "image/webp"],
  },
  // Chống clickjacking cho khu quản trị: không site nào (kể cả chính site này) được nhúng /admin vào iframe.
  // CSP frame-ancestors là chuẩn hiện hành; X-Frame-Options cho trình duyệt cũ. Trang public vẫn cho nhúng.
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
  // Trình duyệt gọi /api/* trên chính domain FE, Next chuyển nguyên sang backend. Cookie phiên đăng nhập do
  // backend đặt nên là cookie của chính domain FE (cùng site): SameSite=Lax là đủ, không cần CORS. Server Next
  // không đọc, không đặt cookie phiên nào. Đường dẫn giữ nguyên /api ở hai đầu, nên cookie refresh
  // (path /api/auth) vẫn được gửi đúng.
  async rewrites() {
    return {
      // Luồng đăng nhập chạy trước mọi route của Next: lỡ ai tạo app/api/auth/... thì đăng nhập vẫn ra backend.
      beforeFiles: [{ source: "/api/auth/:path*", destination: `${apiUrl}/auth/:path*` }],
      // Phần còn lại đặt ở afterFiles: route tĩnh của FE (app/api/revalidate) vẫn được ưu tiên, nhưng chạy
      // trước route động. Đặt ở fallback thì route app/(site)/[lang]/... có thể bắt nhầm
      // /api/<x> thành trang ngôn ngữ "api" rồi trả 404.
      afterFiles: [{ source: "/api/:path*", destination: `${apiUrl}/:path*` }],
      fallback: [],
    };
  },
};

export default withNextIntl(nextConfig);
