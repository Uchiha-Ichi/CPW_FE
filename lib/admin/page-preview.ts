import { API_BASE } from "@/lib/api/config";
import { toBlock } from "@/lib/api/pages";
import type { PublicBlock } from "@/lib/blocks/types";
import type { Locale } from "@/lib/i18n/config";

export type PagePreview = { hasDraft: boolean; blocks: PublicBlock[] };

export type PagePreviewResult =
  | { status: "ok"; data: PagePreview }
  | { status: "unauthenticated" } // 401
  | { status: "not-found" } // 403 hoặc 404
  | { status: "error" }; // 5xx, mạng, timeout, body sai hình dạng

// Lấy bản nháp (hoặc bản đã đăng nếu chưa có nháp) của một trang bằng token admin.
// Không bao giờ ném lỗi: mọi trường hợp không chắc chắn trả "error".
export async function getPagePreview(
  pageKey: string,
  lang: Locale,
  token: string
): Promise<PagePreviewResult> {
  const path = `/pages/${encodeURIComponent(pageKey)}/preview?lang=${lang}`;
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      // Backend treo thì sau 5 giây cho kết quả "error" (lỗi abort rơi vào catch bên dưới).
      signal: AbortSignal.timeout(5000),
    });
    if (res.status === 401) return { status: "unauthenticated" };
    if (res.status === 403 || res.status === 404)
      return { status: "not-found" };
    if (!res.ok) return { status: "error" };

    const body: unknown = await res.json();
    const { hasDraft, blocks } =
      typeof body === "object" && body !== null
        ? (body as { hasDraft?: unknown; blocks?: unknown })
        : {};
    if (typeof hasDraft !== "boolean" || !Array.isArray(blocks))
      return { status: "error" };
    return {
      status: "ok",
      data: {
        hasDraft,
        blocks: blocks.map(toBlock).filter((b): b is PublicBlock => b !== null),
      },
    };
  } catch {
    return { status: "error" };
  }
}
