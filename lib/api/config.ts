// Địa chỉ gốc của backend. Nguồn duy nhất: mọi nơi gọi API import từ đây.
// NEXT_PUBLIC_API_URL đặt ở môi trường build. Thiếu thì dừng, không đoán địa chỉ.
// Phải giữ nguyên dạng process.env.NEXT_PUBLIC_API_URL: Next chỉ nhúng được dạng này vào bundle trình duyệt.
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
if (!apiUrl) throw new Error("Missing environment variable: NEXT_PUBLIC_API_URL");

export const API_BASE = apiUrl;
