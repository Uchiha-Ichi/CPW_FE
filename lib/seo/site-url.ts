// Địa chỉ gốc của site, dùng cho canonical, hreflang, sitemap. NEXT_PUBLIC_SITE_URL đặt ở môi trường build.
// Thiếu thì dừng, không đoán địa chỉ. Không có dấu "/" cuối.
// Phải giữ nguyên dạng process.env.NEXT_PUBLIC_SITE_URL: Next chỉ nhúng được dạng này vào bundle trình duyệt.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
if (!siteUrl) throw new Error("Missing environment variable: NEXT_PUBLIC_SITE_URL");

export const SITE_URL = siteUrl.replace(/\/+$/, "");
