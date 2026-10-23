export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly messages: string[],
  ) {
    super(messages.join(" "));
    this.name = "ApiError";
  }
}

// Lỗi lồng nhau của server có dạng "cover.Thiếu đường dẫn ảnh bìa": bỏ phần "cover.".
const FIELD_PREFIX = /^[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*\.(?=\S)/;

export function stripFieldPrefix(message: string): string {
  return message.replace(FIELD_PREFIX, "");
}

function serverMessages(body: unknown): string[] {
  if (body && typeof body === "object" && "message" in body) {
    const message = (body as { message: unknown }).message;
    if (Array.isArray(message)) {
      return message
        .filter((m): m is string => typeof m === "string")
        .map(stripFieldPrefix);
    }
    if (typeof message === "string") return [stripFieldPrefix(message)];
  }
  return [];
}

export function friendlyMessages(status: number, body: unknown): string[] {
  if (status === 401) return ["Phiên đăng nhập đã hết hạn."];
  if (status === 403) return ["Bạn không có quyền thực hiện thao tác này."];
  if (status === 404) return ["Không tìm thấy bài viết. Có thể bài đã bị xóa."];
  if (status === 413) return ["Ảnh hoặc nội dung quá lớn."];
  if (status === 429) return ["Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút."];
  if (status === 0) return ["Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại."];
  if (status >= 500) return ["Máy chủ đang gặp sự cố. Vui lòng thử lại sau."];
  const messages = serverMessages(body);
  return messages.length > 0
    ? messages
    : ["Dữ liệu chưa hợp lệ. Vui lòng kiểm tra lại."];
}

export function isSessionExpired(err: unknown): boolean {
  return err instanceof ApiError && err.status === 401;
}

export function errorMessages(err: unknown): string[] {
  return err instanceof ApiError
    ? err.messages
    : ["Có lỗi xảy ra. Vui lòng thử lại."];
}
