"use client";

import { useEffect, useRef } from "react";
import { list, num, str } from "@/lib/blocks/read";
import { repeatToMin } from "@/lib/blocks/marquee";
import { Reveal } from "./shared/reveal";
import type { BlockProps } from "./types";

// Server đã render số cuối. Khi chạy trên trình duyệt (và không bật reduced-motion), đặt về 0 rồi
// đếm lên khi cuộn tới. Ghi thẳng textContent nên không cần state. Xuất ra để khối "channels" dùng lại.
export function CountUp({ value, locale }: { value: number; locale: string }) {
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

// Tới chừng này ô thì xếp lưới tĩnh (có đếm số); nhiều hơn thì chạy dải tự trượt để khối không bị dày.
const STATIC_MAX = 5;

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

// Dải tự trượt dùng chung lớp CSS .vcb-marquee của block marquee và photo-gallery: dừng khi rê chuột, và khi bật
// reduced-motion thì thôi trượt, các ô xếp thành lưới (bản lặp bị ẩn). Số không đếm lên vì ô luôn đang chạy ngang.
function StatsMarquee({ items, locale }: { items: Stat[]; locale: string }) {
  const format = new Intl.NumberFormat(locale);
  const loop = repeatToMin(items, 10);
  const renderList = (hiddenList: boolean) => (
    <dl
      className="flex shrink-0 items-start motion-reduce:shrink motion-reduce:flex-wrap motion-reduce:justify-center"
      aria-hidden={hiddenList ? true : undefined}
    >
      {loop.map((item, i) => {
        const copy = i >= items.length;
        return (
          <div
            key={i}
            aria-hidden={copy ? true : undefined}
            className={`flex flex-col-reverse whitespace-nowrap border-l border-border px-12 py-1 md:px-20${copy ? " motion-reduce:hidden" : ""}`}
          >
            <dt className="mt-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {item.label}
            </dt>
            <dd className="text-4xl font-bold tracking-tight md:text-5xl">
              {format.format(item.value)}
              {item.suffix}
            </dd>
          </div>
        );
      })}
    </dl>
  );

  return (
    <section className="border-y border-border bg-muted/20 py-10 md:py-12">
      <div
        className="vcb-marquee"
        style={{ "--vcb-marquee-duration": `${loop.length * 5}s` } as React.CSSProperties}
      >
        <div className="vcb-marquee-track">
          {renderList(false)}
          {renderList(true)}
        </div>
      </div>
    </section>
  );
}

export function StatsBlock({ data, lang }: BlockProps) {
  const locale = lang === "vi" ? "vi-VN" : "en-US";
  const items = list(data.items)
    .map((i) => ({ value: num(i.value), suffix: str(i.suffix) ?? "", label: str(i.label) }))
    .filter((i): i is Stat => i.value !== undefined && Boolean(i.label));
  if (items.length === 0) return null;
  if (items.length > STATIC_MAX) return <StatsMarquee items={items} locale={locale} />;

  return (
    <section className="border-y border-border bg-muted/20 py-10 md:py-12">
      {/* Số cột từ 1024px theo số ô (1–5) để 3 ô không chừa một cột trống. */}
      <dl
        className="mx-auto grid max-w-[1240px] grid-cols-2 gap-x-6 gap-y-10 px-4 lg:grid-cols-[repeat(var(--n),minmax(0,1fr))]"
        style={{ "--n": Math.min(items.length, STATIC_MAX) } as React.CSSProperties}
      >
        {items.map((item, i) => (
          <Reveal key={i} delay={i * 80} className="flex flex-col-reverse max-[519px]:justify-end">
            <dt className="mt-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {item.label}
            </dt>
            {/* Font thân, không dùng Prata: Prata không phân biệt được chữ số 1 với chữ l ("10" đọc thành "l0"). */}
            <dd className="text-4xl font-bold tracking-tight md:text-5xl">
              <CountUp value={item.value} locale={locale} />
              {item.suffix}
            </dd>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}
