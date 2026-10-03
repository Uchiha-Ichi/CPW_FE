// Địa chỉ gốc của site, dùng cho canonical, hreflang, sitemap. Hoàng đặt NEXT_PUBLIC_SITE_URL ở môi trường
// deploy; thiếu thì dùng địa chỉ dev. Không có dấu "/" cuối.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");
