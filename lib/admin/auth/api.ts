// Gọi từ trình duyệt tới /api/auth/* (next.config.ts chuyển sang backend). Backend tự ghi/xoá cookie phiên
// httpOnly và không trả token trong body, nên token không bao giờ tới JS.

const SERVER_DOWN = "Không kết nối được máy chủ. Vui lòng thử lại sau ít phút.";

// Trả câu lỗi để hiện trên form, hoặc null khi đăng nhập thành công (backend đã ghi cookie phiên).
export async function login(email: string, password: string): Promise<string | null> {
  let res: Response;
  try {
    res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    // Mất mạng hoặc server Next tắt: fetch ném lỗi chứ không trả response.
    return SERVER_DOWN;
  }
  if (res.ok) return null;
  // 429: backend chặn tạm vì đăng nhập quá nhiều lần; 5xx: không tới được backend.
  if (res.status === 429) return "Đăng nhập quá nhiều lần. Vui lòng thử lại sau ít phút.";
  if (res.status >= 500) return SERVER_DOWN;
  return "Email hoặc mật khẩu không đúng";
}

// Backend tự thu hồi refresh token rồi xoá cookie phiên.
export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}
