"use client";

import { useEffect, useRef } from "react";
import { list, num, str } from "@/lib/blocks/read";
import { Reveal } from "./shared/reveal";
import type { BlockProps } from "./types";

// Server đã render số cuối. Khi chạy trên trình duyệt (và không bật reduced-motion), đặt về 0 rồi
// đếm lên khi cuộn tới. Ghi thẳng textContent nên không cần state.
function CountUp({ value, locale }: { value: number; locale: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }
    const format = new Intl.NumberFormat(locale);
    el.textContent = format.format(0);
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const duration = 1400;
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = format.format(Math.round(value * eased));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, locale]);

  return <span ref={ref}>{new Intl.NumberFormat(locale).format(value)}</span>;
}

export function StatsBlock({ data, lang }: BlockProps) {
  const locale = lang === "vi" ? "vi-VN" : "en-US";
  const items = list(data.items)
    .map((i) => ({ value: num(i.value), suffix: str(i.suffix) ?? "", label: str(i.label) }))
    .filter(
      (i): i is { value: number; suffix: string; label: string } =>
        i.value !== undefined && Boolean(i.label),
    );
  if (items.length === 0) return null;

  return (
    <section className="border-y border-border bg-muted/20 py-16 md:py-20">
      <dl className="mx-auto grid max-w-[1240px] grid-cols-2 gap-x-6 gap-y-10 px-4 lg:grid-cols-4">
        {items.map((item, i) => (
          <Reveal key={i} delay={i * 80} className="flex flex-col-reverse">
            <dt className="mt-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {item.label}
            </dt>
            <dd className="font-display text-5xl font-bold md:text-6xl">
              <CountUp value={item.value} locale={locale} />
              {item.suffix}
            </dd>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}
