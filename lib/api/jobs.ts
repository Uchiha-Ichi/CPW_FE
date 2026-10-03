import { apiGet } from "./client";
import type { ApiResult } from "./result";
import { CACHE_TAGS } from "./tags";

// Hình dạng GET /jobs/public (cpw_be/src/jobs/schemas): chỉ trả việc có status "Đang tuyển".
// createdAt có mặt vì schema bật timestamps; để optional vì Swagger không mô tả.
export interface PublicJob {
  slug: string;
  title: string;
  department: string;
  location: string;
  type: string;
  status: string;
  description?: string;
  createdAt?: string;
}

function isJob(value: unknown): value is PublicJob {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.slug === "string" &&
    typeof v.title === "string" &&
    typeof v.department === "string" &&
    typeof v.location === "string" &&
    typeof v.type === "string"
  );
}

export async function getJobs(): Promise<ApiResult<PublicJob[]>> {
  const result = await apiGet<unknown>("/jobs/public", {
    tags: [CACHE_TAGS.jobs],
  });
  if (result.status === "error") return result;
  if (result.status === "not-found") return { status: "ok", data: [] };
  if (!Array.isArray(result.data)) return { status: "error" };
  return { status: "ok", data: result.data.filter(isJob) };
}

export async function getJobBySlug(
  slug: string
): Promise<ApiResult<PublicJob>> {
  const result = await apiGet<unknown>(
    `/jobs/public/${encodeURIComponent(slug)}`,
    {
      tags: [CACHE_TAGS.jobs],
    }
  );
  if (result.status !== "ok") return result;
  return isJob(result.data)
    ? { status: "ok", data: result.data }
    : { status: "error" };
}
