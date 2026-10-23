// Login và form liên hệ gọi backend từ server Next, nên backend chỉ thấy IP của server (Vercel) và giới hạn
// tần suất sẽ đếm chung cho mọi người. Gửi kèm IP thật của người dùng cùng khoá chung FORWARDED_IP_SECRET;
// backend chỉ tin IP này khi khoá khớp (cpw_be/src/utils/client-ip.util.ts, cùng tên header).
// FORWARDED_IP_SECRET là biến server (không có tiền tố NEXT_PUBLIC_) nên không bị nhúng vào bundle trình duyệt.
// Trên Vercel, x-forwarded-for do Vercel ghi đè bằng IP thật của người dùng nên client không tự điền được.
export function forwardedClientIpHeaders(requestHeaders: Headers): Record<string, string> {
  const secret = process.env.FORWARDED_IP_SECRET?.trim();
  const ip =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip")?.trim();
  if (!secret || !ip) return {};
  return { "x-client-ip": ip, "x-client-ip-secret": secret };
}
