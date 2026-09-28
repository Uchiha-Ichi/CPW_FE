import { notFound } from "next/navigation";
import { findJobBySlug } from "@/lib/careers";
import { JOBS } from "@/data/careers";

export default function JobDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const job = findJobBySlug(JOBS, params.slug);
  if (!job) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">{job.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {job.department} · {job.location} · {job.type} · {job.status}
      </p>
      <p className="mt-6">{job.description}</p>
    </section>
  );
}
