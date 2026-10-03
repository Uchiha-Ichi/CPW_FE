import { apiGet } from "./client";
import type { ApiResult } from "./result";
import { CACHE_TAGS } from "./tags";
import type { Locale } from "../i18n/config";
import type { PublicBlock, PublicPage } from "../blocks/types";

export type PageKey = "home" | "about";

function toBlock(value: unknown): PublicBlock | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  if (typeof v.id !== "string" || typeof v.type !== "string") return null;
  if (typeof v.data !== "object" || v.data === null || Array.isArray(v.data))
    return null;
  return { id: v.id, type: v.type, data: v.data as Record<string, unknown> };
}

// Lấy block đã đăng của một trang, chữ đã được backend giải sẵn theo `lang`.
// 404 là "chưa có nội dung" (ok, rỗng); lỗi mạng/5xx là "error" để trang hiện thông báo khác.
export async function getPublicPage(
  pageKey: PageKey,
  lang: Locale
): Promise<ApiResult<PublicPage>> {
  const result = await apiGet<unknown>(
    `/pages/public/${pageKey}?lang=${lang}`,
    {
      tags: [CACHE_TAGS.pages],
    }
  );
  if (result.status === "error") return result;
  if (result.status === "not-found") {
    return { status: "ok", data: { pageKey, blocks: [] } };
  }
  const body = result.data;
  const raw =
    typeof body === "object" &&
    body !== null &&
    Array.isArray((body as { blocks?: unknown }).blocks)
      ? (body as { blocks: unknown[] }).blocks
      : [];
  return {
    status: "ok",
    data: {
      pageKey,
      blocks: raw.map(toBlock).filter((b): b is PublicBlock => b !== null),
    },
  };
}
