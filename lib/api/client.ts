import { API_BASE } from "./config";
import type { ApiResult } from "./result";

export const DEFAULT_REVALIDATE_SECONDS = 60;

// Đọc một endpoint public. Không bao giờ ném lỗi: trang public không được sập khi API tắt.
// `tags` cho phép xóa cache theo tag (revalidateTag) khi admin ghi dữ liệu.
export async function apiGet<T>(
  path: string,
  options: { revalidate?: number; tags?: readonly string[] } = {}
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      next: {
        revalidate: options.revalidate ?? DEFAULT_REVALIDATE_SECONDS,
        ...(options.tags ? { tags: [...options.tags] } : {}),
      },
    });
    if (res.status === 404) return { status: "not-found" };
    if (!res.ok) {
      console.error(`apiGet(${path}): API responded ${res.status}`);
      return { status: "error" };
    }
    return { status: "ok", data: (await res.json()) as T };
  } catch (err) {
    console.error(`apiGet(${path}): request failed`, err);
    return { status: "error" };
  }
}
