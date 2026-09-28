import { notFound } from "next/navigation";
import { getPublicJobBySlug } from "@/lib/api/jobs";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const job = await getPublicJobBySlug(resolvedParams.slug);
  if (!job) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">{job.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {job.department} · {job.location} · {job.type} · {job.status}
      </p>
      <p className="mt-6 whitespace-pre-wrap">{job.description}</p>
    </section>
  );
}
