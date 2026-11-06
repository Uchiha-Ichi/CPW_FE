import "server-only";

// Địa chỉ gốc của backend. Nguồn duy nhất: mọi nơi gọi API import từ đây, và chỉ code chạy trên server Next.
// API_URL không có tiền tố NEXT_PUBLIC_ nên không bị nhúng vào bundle trình duyệt; "server-only" làm build báo lỗi
// nếu một client component import file này. Trình duyệt cần gửi gì tới backend thì đi qua route của FE
// (ví dụ app/api/applications/route.ts). Thiếu biến thì dừng, không đoán địa chỉ.
const apiUrl = process.env.API_URL;
if (!apiUrl) throw new Error("Missing environment variable: API_URL");

export const API_BASE = apiUrl;
