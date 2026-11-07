// Gọi API backend từ trình duyệt qua /api/* (next.config.ts chuyển nguyên sang backend). Cookie phiên do backend
// đặt (httpOnly) nên trình duyệt tự gửi kèm; code này không bao giờ thấy token. Chỉ đọc cookie cpw_csrf, cookie
// mà backend cố ý để JS đọc được, rồi gửi lại trong header X-CSRF-Token cho request ghi dữ liệu
// (cpw_be/src/auth/guards/csrf.guard.ts).

const CSRF_COOKIE = "cpw_csrf";
const CSRF_HEADER = "X-CSRF-Token";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

// Nhiều request cùng gặp 401 (mở một trang bắn nhiều API) chỉ gia hạn một lần: backend đổi refresh token mỗi
// lần dùng, gọi trùng thì lần sau bị từ chối.
let refreshing: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  refreshing ??= fetch("/api/auth/refresh", { method: "POST" })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

// Đọc mã CSRF mỗi lần gửi: gia hạn phiên xong backend cấp mã mới.
function send(path: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (!SAFE_METHODS.has((init?.method ?? "GET").toUpperCase())) {
    const csrf = readCookie(CSRF_COOKIE);
    if (csrf) headers.set(CSRF_HEADER, csrf);
  }
  return fetch(`/api${path}`, { ...init, headers });
}

// `path` là đường dẫn của backend, ví dụ "/posts/admin?limit=1". Access token hết hạn (401): gia hạn một lần
// rồi gửi lại đúng request cũ; vẫn 401 thì trả nguyên cho nơi gọi. Mất mạng thì fetch ném lỗi như thường.
export async function adminFetch(path: string, init?: RequestInit): Promise<Response> {
  const res = await send(path, init);
  if (res.status !== 401) return res;
  if (!(await refreshSession())) return res;
  return send(path, init);
}
