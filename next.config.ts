import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

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
};

export default withNextIntl(nextConfig);
