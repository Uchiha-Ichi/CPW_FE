"use client";

import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { PublicJob } from "@/lib/api/jobs";
import { splitParagraphs } from "@/lib/jobs/text";
import { cn } from "@/lib/utils";

export type JobRowLabels = {
  apply: string;
  viewPage: string;
  noDescription: string;
};

export function JobRow({
  job,
  index,
  open,
  onToggle,
  onApply,
  labels,
}: {
  job: PublicJob;
  index: number;
  open: boolean;
  onToggle: () => void;
  onApply: () => void;
  labels: JobRowLabels;
}) {
  const panelId = useId();
  const paragraphs = splitParagraphs(job.description);

  return (
    <div>
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="group flex w-full cursor-pointer flex-col justify-between gap-6 py-8 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex-row md:items-center"
        >
          <span className="flex items-start gap-6 md:items-center">
            <span aria-hidden className="hidden text-xl font-semibold text-muted-foreground/40 md:block">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="block">
              <span className="mb-2 block text-xl font-bold leading-[1.2] transition-colors group-hover:text-primary md:text-2xl">
                {job.title}
              </span>
              <span className="flex flex-wrap items-center gap-4 text-sm font-normal text-muted-foreground">
                {[job.type, job.location, job.department].map((text, i) => (
                  <span key={`${i}-${text}`} className="flex items-center gap-2">
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                    {text}
                  </span>
                ))}
              </span>
            </span>
          </span>
          <span
            aria-hidden
            className={cn(
              "hidden h-12 w-12 items-center justify-center rounded-full border border-border transition-all motion-reduce:transition-none group-hover:border-primary group-hover:bg-primary group-hover:text-white md:flex",
              open && "rotate-90 border-primary bg-primary text-white",
            )}
          >
            →
          </span>
        </button>
      </h3>

      {/* Mô tả luôn nằm trong DOM (công cụ tìm kiếm và link "Xem trang riêng" vẫn thấy); chỉ thu gọn bằng CSS. */}
      <div
        id={panelId}
        inert={!open}
        className={cn(
          "grid transition-[grid-template-rows] duration-300 motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="max-w-3xl space-y-5 pb-8 md:pl-14">
            <div className="space-y-5 text-[1.05rem] leading-8 text-foreground/90">
              {paragraphs.length > 0 ? (
                paragraphs.map((text, i) => (
                  <p key={i} className="whitespace-pre-line">{text}</p>
                ))
              ) : (
                <p className="text-muted-foreground">{labels.noDescription}</p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Button
                type="button"
                size="lg"
                onClick={onApply}
                className="h-12 rounded-full bg-foreground px-8 text-base font-semibold text-background hover:bg-primary hover:text-white"
              >
                {labels.apply}
              </Button>
              <Link
                href={`/careers/${encodeURIComponent(job.slug)}`}
                className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline max-[519px]:inline-flex max-[519px]:min-h-11 max-[519px]:items-center"
              >
                {labels.viewPage}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
