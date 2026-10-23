import { apiGet } from "./client";
import type { ApiResult } from "./result";
import { CACHE_TAGS } from "./tags";
import type { Locale } from "../i18n/config";

// Hình dạng response của GET /products/public (backend: cpw_be/src/products/products.service.ts findPublic).
export interface PublicProduct {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  comingSoon: boolean;
}

function isPublicProductList(value: unknown): value is PublicProduct[] {
  if (!Array.isArray(value)) return false;
  return value.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as Record<string, unknown>)._id === "string" &&
      typeof (item as Record<string, unknown>).name === "string" &&
      typeof (item as Record<string, unknown>).comingSoon === "boolean"
  );
}

export async function getPublicProducts(
  lang: Locale
): Promise<ApiResult<PublicProduct[]>> {
  const result = await apiGet<unknown>(`/products/public?lang=${lang}`, {
    tags: [CACHE_TAGS.products],
  });
  if (result.status !== "ok") return result;
  return isPublicProductList(result.data)
    ? { status: "ok", data: result.data }
    : { status: "error" };
}
