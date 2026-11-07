import "server-only";

// Địa chỉ gốc của backend cho code chạy trên server Next: mọi nơi gọi API từ server import từ đây
// (next.config.ts đọc cùng biến cho rewrites). API_URL không có tiền tố NEXT_PUBLIC_ nên không bị nhúng vào bundle
// trình duyệt; "server-only" làm build báo lỗi nếu một client component import file này. Trình duyệt chỉ gọi
// /api/* trên chính domain FE (rewrites trong next.config.ts). Thiếu biến thì dừng, không đoán địa chỉ.
const apiUrl = process.env.API_URL;
if (!apiUrl) throw new Error("Missing environment variable: API_URL");

export const API_BASE = apiUrl;
