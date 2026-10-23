import { ApiError } from "@/lib/admin/api-error";

const CONFLICT_FALLBACK =
  "Trang vừa được cập nhật ở nơi khác. Hãy tải lại rồi sửa tiếp.";

// Lấy câu lỗi của server nguyên văn (backend đã viết tiếng Việt, có "Khối 2 (Đầu trang): ...").
// Không cắt tiền tố như post-errors vì sẽ làm hỏng câu.
function serverMessages(body: unknown): string[] {
  if (body && typeof body === "object" && "message" in body) {
    const message = (body as { message: unknown }).message;
    if (Array.isArray(message)) {
      return message.filter((m): m is string => typeof m === "string");
    }
    if (typeof message === "string") return [message];
  }
  return [];
}

export function pageFriendlyMessages(status: number, body: unknown): string[] {
  if (status === 0) return ["Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại."];
  if (status === 401) return ["Phiên đăng nhập đã hết hạn."];
  if (status === 403) return ["Bạn không có quyền thực hiện thao tác này."];
  if (status === 404) return ["Không tìm thấy trang. Hãy tải lại trang quản trị."];
  if (status === 409) {
    const messages = serverMessages(body);
    return messages.length > 0 ? messages : [CONFLICT_FALLBACK];
  }
  if (status === 413) return ["Ảnh hoặc nội dung quá lớn."];
  if (status === 429) return ["Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút."];
  if (status >= 500) return ["Máy chủ đang gặp sự cố. Vui lòng thử lại sau."];
  const messages = serverMessages(body);
  return messages.length > 0
    ? messages
    : ["Dữ liệu chưa hợp lệ. Vui lòng kiểm tra lại."];
}

export function isConflict(err: unknown): boolean {
  return err instanceof ApiError && err.status === 409;
}
