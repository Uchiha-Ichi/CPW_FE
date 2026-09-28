export interface Job {
  slug: string;
  title: string;
  department: string;
  location: string;
  type: string;
  status: "Đang tuyển" | "Đã đóng";
  description: string;
}

export function findJobBySlug(jobs: Job[], slug: string): Job | undefined {
  return jobs.find((job) => job.slug === slug);
}
