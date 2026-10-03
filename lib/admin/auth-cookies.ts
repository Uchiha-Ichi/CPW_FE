// Tên cookie phiên của FE (admin_*) và của backend (crmspd_*).
export const ADMIN_TOKEN_COOKIE = "admin_token";
export const ADMIN_REFRESH_COOKIE = "admin_rt";
export const ADMIN_REFRESHED_COOKIE = "admin_just_refreshed";
export const BACKEND_ACCESS_COOKIE = "crmspd_at";
export const BACKEND_REFRESH_COOKIE = "crmspd_rt";

export type ParsedSetCookie = { value: string; maxAge: number | null };

// Tìm cookie `name` trong danh sách chuỗi Set-Cookie; trả giá trị và Max-Age (giây, nếu có và > 0).
// Cookie rỗng (backend xóa cookie) coi như không có.
export function parseSetCookie(
  setCookies: readonly string[],
  name: string,
): ParsedSetCookie | null {
  for (const line of setCookies) {
    const [pair, ...attributes] = line.split(";").map((part) => part.trim());
    const eq = pair.indexOf("=");
    if (eq < 0 || pair.slice(0, eq) !== name) continue;
    const value = pair.slice(eq + 1);
    if (!value) return null;
    let maxAge: number | null = null;
    for (const attribute of attributes) {
      const [key, raw] = attribute.split("=");
      if (key.toLowerCase() === "max-age") {
        const seconds = Number(raw);
        if (Number.isFinite(seconds) && seconds > 0) maxAge = Math.floor(seconds);
      }
    }
    return { value, maxAge };
  }
  return null;
}
