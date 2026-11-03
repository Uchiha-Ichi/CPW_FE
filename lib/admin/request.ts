import { ApiError } from "./api-error";

// Mọi gọi API admin từ trình duyệt đi qua proxy của chính Next (app/api/admin/proxy/[...path]/route.ts).
const PROXY_BASE = "/api/admin/proxy";

export const JSON_HEADERS = { "Content-Type": "application/json" };

// Tạo hàm request cho một mảng admin. `toMessages` đổi mã lỗi + body thành câu hiện cho admin
// (mỗi mảng có câu 404 riêng: bài viết, trang, bảng tài nguyên).
export function createAdminRequest(toMessages: (status: number, body: unknown) => string[]) {
  return async function request<T = unknown>(path: string, init?: RequestInit): Promise<T> {
    let res: Response;
    try {
      res = await fetch(`${PROXY_BASE}${path}`, init);
    } catch {
      throw new ApiError(0, toMessages(0, null));
    }
    const text = await res.text();
    let body: unknown = null;
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
    }
    if (!res.ok) throw new ApiError(res.status, toMessages(res.status, body));
    return body as T;
  };
}

// Kết quả của POST /uploads và /uploads/video.
export interface UploadedImage {
  url: string;
  publicId: string;
}

// Khớp APP_CONSTANTS.MAX_FILE_SIZE ở backend (cpw_be).
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

// Kiểm ngay ở trình duyệt để báo lỗi sớm, không đợi backend từ chối.
export function assertUploadableImage(file: File): void {
  if (!file.type.startsWith("image/")) {
    throw new ApiError(400, ["Chỉ nhận tệp ảnh (PNG, JPG, WEBP, GIF, HEIC)."]);
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new ApiError(400, ["Ảnh quá lớn (tối đa 10MB)."]);
  }
}
