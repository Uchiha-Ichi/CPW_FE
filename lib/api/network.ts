import { apiGet } from "./client";
import type { ApiResult } from "./result";
import { CACHE_TAGS } from "./tags";

// GET /network/public: danh sách quốc gia thô; lib/blocks/network-geometry.ts (toPins) lọc và chuẩn hóa.
export async function getNetwork(): Promise<ApiResult<unknown[]>> {
  const result = await apiGet<unknown>("/network/public", {
    tags: [CACHE_TAGS.network],
  });
  if (result.status === "error") return result;
  if (result.status === "not-found") return { status: "ok", data: [] };
  return Array.isArray(result.data)
    ? { status: "ok", data: result.data }
    : { status: "error" };
}
