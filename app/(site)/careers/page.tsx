import Link from "next/link";
import { Card } from "@/components/ui/card";
import { JOBS } from "@/data/careers";

export default function CareersPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold">Tuyển dụng</h1>
      <div className="mt-6 grid gap-4">
        {JOBS.map((job) => (
          <Link key={job.slug} href={`/careers/${job.slug}`}>
            <Card className="p-6 hover:bg-muted/50">
              <h2 className="font-medium">{job.title}</h2>
              <p className="text-sm text-muted-foreground">
                {job.department} · {job.location} · {job.type}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
