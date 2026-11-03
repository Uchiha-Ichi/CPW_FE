// Gọi từ trình duyệt tới route đăng nhập/đăng xuất của chính Next (app/api/admin/(auth)/), không gọi thẳng backend.
// Token không tới trình duyệt: các route đó tự ghi/xóa cookie httpOnly (xem cookies.ts).

const SERVER_DOWN = "Không kết nối được máy chủ. Vui lòng thử lại sau ít phút.";

// Trả câu lỗi để hiện trên form, hoặc null khi đăng nhập thành công (route đã ghi cookie phiên).
export async function login(email: string, password: string): Promise<string | null> {
  let res: Response;
  try {
    res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    // Mất mạng hoặc server Next tắt: fetch ném lỗi chứ không trả response.
    return SERVER_DOWN;
  }
  if (res.ok) return null;
  // 429: backend chặn tạm vì đăng nhập quá nhiều lần; 5xx/503: không tới được backend.
  if (res.status === 429) return "Đăng nhập quá nhiều lần. Vui lòng thử lại sau ít phút.";
  if (res.status >= 500) return SERVER_DOWN;
  return "Email hoặc mật khẩu không đúng";
}

// Route tự thu hồi refresh token ở backend rồi xóa cookie phiên.
export async function logout(): Promise<void> {
  await fetch("/api/admin/logout", { method: "POST" });
}
