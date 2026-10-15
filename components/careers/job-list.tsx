"use client";

import { useState } from "react";
import { Reveal } from "@/components/blocks/shared/reveal";
import { useApply } from "@/components/careers/apply-context";
import { JobRow, type JobRowLabels } from "@/components/careers/job-row";
import type { PublicJob } from "@/lib/api/jobs";

// Mở một vị trí thì vị trí đang mở tự đóng; bấm lại vị trí đang mở để đóng.
export function JobList({ jobs, labels }: { jobs: PublicJob[]; labels: JobRowLabels }) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const { requestApply } = useApply();

  return (
    <ul className="flex flex-col divide-y divide-border">
      {jobs.map((job, index) => (
        <li key={job.slug}>
          <Reveal>
            <JobRow
              job={job}
              index={index}
              open={openSlug === job.slug}
              onToggle={() => setOpenSlug((current) => (current === job.slug ? null : job.slug))}
              onApply={() => requestApply(job.title)}
              labels={labels}
            />
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
