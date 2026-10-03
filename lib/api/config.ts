// Địa chỉ gốc của backend. Nguồn duy nhất: mọi nơi gọi API import từ đây.
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
