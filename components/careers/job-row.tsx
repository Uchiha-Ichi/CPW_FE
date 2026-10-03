import { Link } from "@/i18n/navigation";
import type { PublicJob } from "@/lib/api/jobs";

export function JobRow({ job, index }: { job: PublicJob; index: number }) {
  return (
    <Link
      href={`/careers/${encodeURIComponent(job.slug)}`}
      className="group -mx-6 flex flex-col justify-between gap-6 rounded-xl px-6 py-8 transition-colors hover:bg-muted/30 md:flex-row md:items-center"
    >
      <div className="flex items-start gap-6 md:items-center">
        <span aria-hidden className="hidden font-display text-xl font-light text-muted-foreground/40 md:block">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div>
          <h3 className="mb-2 text-2xl font-bold leading-[1.2] transition-colors group-hover:text-primary">
            {job.title}
          </h3>
          <ul className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {[job.type, job.location, job.department].map((text, i) => (
              <li key={`${i}-${text}`} className="flex items-center gap-2">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <span
        aria-hidden
        className="hidden h-12 w-12 items-center justify-center rounded-full border border-border transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-white md:flex"
      >
        →
      </span>
    </Link>
  );
}
