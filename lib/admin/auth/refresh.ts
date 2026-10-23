import { API_BASE } from "@/lib/api/config";

export type RefreshedSession = {
  accessToken: string;
  refreshToken: string;
  refreshMaxAge: number | null;
};

// Đọc cặp token trong body JSON mà backend trả ở POST /auth/login và /auth/refresh
// ({ accessToken, refreshToken, refreshExpiresIn } — refreshExpiresIn tính bằng giây). Sai hình thì null.
export function readTokenResponse(body: unknown): RefreshedSession | null {
  if (typeof body !== "object" || body === null) return null;
  const { accessToken, refreshToken, refreshExpiresIn } = body as Record<string, unknown>;
  if (typeof accessToken !== "string" || !accessToken) return null;
  if (typeof refreshToken !== "string" || !refreshToken) return null;
  const refreshMaxAge =
    typeof refreshExpiresIn === "number" && Number.isFinite(refreshExpiresIn) && refreshExpiresIn > 0
      ? Math.floor(refreshExpiresIn)
      : null;
  return { accessToken, refreshToken, refreshMaxAge };
}

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
    return readTokenResponse(await res.json());
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
