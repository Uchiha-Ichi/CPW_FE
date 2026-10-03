// Kết quả đọc API: phân biệt "có dữ liệu", "không tồn tại" (404) và "lỗi" (mạng, 5xx, JSON hỏng)
// để trang hiện đúng trạng thái thay vì coi mọi thất bại là danh sách rỗng.
export type ApiResult<T> =
  | { status: "ok"; data: T }
  | { status: "not-found" }
  | { status: "error" };
