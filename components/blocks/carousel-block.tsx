"use client";

import { useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useTranslations } from "next-intl";
import { SectionHead } from "./shared/section-head";
import { Reveal } from "./shared/reveal";
import { list, str } from "@/lib/blocks/read";
import type { BlockProps } from "./types";

export function CarouselBlock({ data }: BlockProps) {
  const [viewportRef, api] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps" });
  const t = useTranslations("Carousel");

  // Người dùng bật reduced-motion thì cuộn tức thì (không hoạt ảnh).
  useEffect(() => {
    if (api && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      api.reInit({ duration: 0 });
    }
  }, [api]);

  const title = str(data.title);
  const items = list(data.items)
    .map((i) => ({ t: str(i.t), d: str(i.d) }))
    .filter((i) => i.t);
  if (!title || items.length === 0) return null;

  const buttonClass =
    "flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-lg transition-colors hover:border-primary hover:text-primary";

  return (
    <section className="border-b border-border bg-muted/10 py-20 md:py-28">
      <div className="mx-auto max-w-[1240px] px-4">
        <div className="flex items-end justify-between gap-6">
          <SectionHead eyebrow={str(data.eyebrow)} title={title} flush />
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              aria-label={t("prev")}
              className={buttonClass}
              onClick={() => api?.scrollPrev()}
            >
              ←
            </button>
            <button
              type="button"
              aria-label={t("next")}
              className={buttonClass}
              onClick={() => api?.scrollNext()}
            >
              →
            </button>
          </div>
        </div>

        <div
          ref={viewportRef}
          className="mt-12 overflow-hidden"
          role="region"
          aria-roledescription="carousel"
          aria-label={t("region")}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") api?.scrollPrev();
            if (e.key === "ArrowRight") api?.scrollNext();
          }}
        >
          <div className="-ml-4 flex touch-pan-y">
            {items.map((item, i) => (
              <div
                key={i}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} / ${items.length}`}
                className="min-w-0 flex-[0_0_85%] pl-4 sm:flex-[0_0_45%] lg:flex-[0_0_30%]"
              >
                <Reveal delay={i * 80} className="h-full">
                  <article className="flex h-full min-h-[220px] flex-col justify-between rounded-2xl border border-border bg-card p-8">
                    <span className="font-display text-4xl font-light text-muted-foreground/50">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="mt-8">
                      <h3 className="text-xl font-bold">{item.t}</h3>
                      {item.d && (
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {item.d}
                        </p>
                      )}
                    </div>
                  </article>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
