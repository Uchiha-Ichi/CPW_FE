import type { paths } from "./schema";
import { API_BASE, fetchPublicList } from "./client";

export type PublicJob = {
  slug: string;
  title: string;
  department: string;
  location: string;
  type: string;
  status: string;
  description?: string;
};

export function getPublicJobs(): Promise<PublicJob[]> {
  return fetchPublicList<PublicJob>("/jobs/public");
}

export async function getPublicJobBySlug(
  slug: string
): Promise<PublicJob | null> {
  try {
    const res = await fetch(`${API_BASE}/jobs/public/${slug}`, {
      next: { revalidate: 60 },
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      console.error(`getPublicJobBySlug(${slug}): API responded ${res.status}`);
      return null;
    }
    return (await res.json()) as PublicJob;
  } catch (err) {
    console.error(`getPublicJobBySlug(${slug}): fetch failed`, err);
    return null;
  }
}
