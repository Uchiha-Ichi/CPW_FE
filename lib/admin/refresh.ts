import { API_BASE } from "@/lib/api/config";
import {
  BACKEND_ACCESS_COOKIE,
  BACKEND_REFRESH_COOKIE,
  parseSetCookie,
} from "./auth-cookies";

export type RefreshedSession = {
  accessToken: string;
  refreshToken: string;
  refreshMaxAge: number | null;
};

// Backend xoay refresh token mỗi lần dùng (chỉ lưu một hash): hai lần refresh cùng token cũ thì lần sau
// bị từ chối. Nên gom các lần gọi trùng token thành một, và giữ kết quả thành công thêm một lúc cho
// request đến muộn vẫn cầm token cũ.
const REUSE_WINDOW_MS = 10_000;

type Entry = { promise: Promise<RefreshedSession | null>; settledAt: number | null };
const entries = new Map<string, Entry>();

async function callRefresh(refreshToken: string): Promise<RefreshedSession | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const setCookies = res.headers.getSetCookie();
    const access = parseSetCookie(setCookies, BACKEND_ACCESS_COOKIE);
    const refresh = parseSetCookie(setCookies, BACKEND_REFRESH_COOKIE);
    if (!access || !refresh) return null;
    return {
      accessToken: access.value,
      refreshToken: refresh.value,
      refreshMaxAge: refresh.maxAge,
    };
  } catch {
    return null;
  }
}

// Không bao giờ ném lỗi; thất bại trả null.
export function refreshSession(refreshToken: string): Promise<RefreshedSession | null> {
  const now = Date.now();
  for (const [key, entry] of entries) {
    if (entry.settledAt !== null && now - entry.settledAt > REUSE_WINDOW_MS) entries.delete(key);
  }
  const existing = entries.get(refreshToken);
  if (existing) return existing.promise;

  const entry: Entry = { promise: callRefresh(refreshToken), settledAt: null };
  entries.set(refreshToken, entry);
  void entry.promise.then((result) => {
    if (result) entry.settledAt = Date.now();
    else entries.delete(refreshToken);
  });
  return entry.promise;
}
