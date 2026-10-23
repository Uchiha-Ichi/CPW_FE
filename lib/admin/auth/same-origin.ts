// Chống CSRF cho các route /api/admin ghi dữ liệu (đăng nhập, đăng xuất, proxy POST/PUT/PATCH/DELETE).
// Cookie SameSite=Lax đã chặn request từ site khác; bước này chặn thêm trang ở subdomain khác cùng tên miền
// (trình duyệt coi là "cùng site" nên vẫn gửi cookie Lax). Server Action của Next tự kiểm giống hệt
// (node_modules/next/dist/server/app-render/action-handler.js, parseHostHeader), route handler thì không:
// host trong Origin phải trùng x-forwarded-host (giá trị đầu) hoặc host. Thiếu Origin thì cho qua như Next — trình
// duyệt luôn gửi Origin khi trang khác POST sang, nên request thiếu Origin không mang được cookie của nạn nhân.
export function isSameOriginRequest(headers: Headers): boolean {
  const origin = headers.get("origin");
  if (origin === null) return true;
  const host = headers.get("x-forwarded-host")?.split(",")[0]?.trim() || headers.get("host");
  if (!host || origin === "null") return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
