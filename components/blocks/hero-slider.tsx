"use client";

import { useEffect, useState, type ReactNode } from "react";
import { CloudinaryMedia } from "./shared/cloudinary-media";
import { cn } from "@/lib/utils";
import styles from "./hero-slider.module.css";

const pad = (n: number) => String(n).padStart(2, "0");

// Hero tràn màn hình: ảnh xếp chồng, ảnh mới nở đè lên ảnh cũ. `children` là phần chữ do server render (giữ <h1>
// trong HTML), nằm đè lên lớp ảnh. Việc tự chuyển do chính thanh tiến trình điều khiển (animationend), nên
// dừng/chạy lại theo CSS và tắt hẳn khi prefers-reduced-motion mà không cần timer riêng.
export function HeroSlider({ slides, children }: { slides: string[]; children: ReactNode }) {
  const total = slides.length;
  const [index, setIndex] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  // Các ảnh sau slide đầu chỉ mount sau ~1s để không tranh băng thông với ảnh đầu (LCP).
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  function goTo(next: number) {
    if (next === index) return;
    setPrev(index);
    setIndex(next);
    setReady(true);
  }

  return (
    <section
      data-moved={prev !== null ? "" : undefined}
      className={cn(
        styles.root,
        "relative isolate flex min-h-[max(560px,calc(100svh-72px))] items-center overflow-hidden border-b border-border bg-black text-white min-[880px]:min-h-[max(560px,calc(100svh-88px))]",
      )}
    >
      <div aria-hidden className={styles.stage}>
        {slides.map(
          (src, i) =>
            (i === 0 || ready) && (
              <div
                key={i}
                className={styles.slide}
                data-state={i === index ? "active" : i === prev ? "prev" : "idle"}
              >
                <div className={styles.zoom}>
                  <CloudinaryMedia
                    src={src}
                    alt=""
                    sizes="100vw"
                    variant="loop"
                    className="object-cover"
                    imageProps={i === 0 ? { preload: true, fetchPriority: "high" } : undefined}
                  />
                </div>
              </div>
            ),
        )}
      </div>
      <div aria-hidden className={styles.scrim} />

      <div className="relative z-10 mx-auto w-full max-w-[1240px] px-4 py-16 md:py-24">{children}</div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20">
        <div className="mx-auto flex max-w-[1240px] items-end justify-between px-4 pb-6 md:pb-8">
          <span aria-hidden className={styles.cue} />
          {total > 1 && (
            <div className="pointer-events-auto flex items-center gap-4">
              <span aria-hidden className="text-sm font-semibold tabular-nums tracking-widest text-white/90">
                {pad(index + 1)} <span className="text-white/45">/ {pad(total)}</span>
              </span>
              <div className="flex gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={styles.seg}
                    aria-label={`${i + 1} / ${total}`}
                    aria-current={i === index ? "true" : undefined}
                    onClick={() => goTo(i)}
                  >
                    {i === index && (
                      <span
                        key={index}
                        className={styles.fill}
                        onAnimationEnd={(e) => {
                          if (e.target === e.currentTarget) goTo((index + 1) % total);
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
