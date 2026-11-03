"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useWheelDrag } from "./shared/use-wheel-drag";
import styles from "./timeline-block.module.css";

export interface TimelineItem {
  t: string;
  d?: string;
}

// Mốc là năm (đúng 4 chữ số) thì hiện cỡ lớn, màu nhấn; các mốc dạng câu giữ cỡ tiêu đề thường.
const YEAR = /^\d{4}$/;

// Thời gian mỗi mốc tự nổi trước khi chạy sang mốc kế tiếp (~2 giây).
const STEP_MS = 2200;

// Căn giữa mốc đang chọn (align: "center", containScroll: false để cả mốc đầu và mốc cuối đều ra đúng chính giữa).
const EMBLA_OPTIONS: Parameters<typeof useEmblaCarousel>[0] = {
  align: "center",
  containScroll: false,
};

// Dải mốc hành trình thu gọn: mốc đang chọn luôn trượt ra chính giữa, tự động chạy qua từng năm sau mỗi ~2s,
// và hiển thị nội dung chi tiết trong khung thẻ nổi ở trung tâm bên dưới.
export function TimelineTrack({ items }: { items: TimelineItem[] }) {
  const count = items.length;
  const t = useTranslations("Carousel");
  const rootRef = useRef<HTMLDivElement>(null);
  const [viewportRef, api] = useEmblaCarousel(EMBLA_OPTIONS);
  useWheelDrag(api);

  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const safeActive = active < count ? active : 0;

  // Theo dõi chế độ giảm chuyển động của hệ điều hành.
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  // Chỉ bắt đầu tự chạy khi người xem đã cuộn tới vùng Timeline.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry) setInView(entry.isIntersecting);
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Đồng bộ khi người dùng kéo dải bằng chuột/cảm ứng để mốc dừng ở giữa tự thành mốc active.
  useEffect(() => {
    if (!api) return;
    const onSelect = () => {
      const snap = api.selectedScrollSnap();
      setActive((prev) => (prev === snap ? prev : snap));
    };
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Đưa mốc đang active ra đúng chính giữa khung nhìn.
  useEffect(() => {
    if (!api) return;
    if (api.selectedScrollSnap() !== safeActive) {
      api.scrollTo(safeActive, reducedMotion);
    }
    const onReInit = () => api.scrollTo(safeActive, true);
    api.on("reInit", onReInit);
    return () => {
      api.off("reInit", onReInit);
    };
  }, [api, safeActive, reducedMotion]);

  // Tự động chuyển sang mốc kế tiếp sau mỗi STEP_MS (~2s); quay vòng về đầu khi hết mốc cuối.
  useEffect(() => {
    if (!inView || paused || reducedMotion || count < 2) return;
    const id = window.setTimeout(() => {
      setActive((prev) => ((prev < count ? prev : 0) + 1) % count);
    }, STEP_MS);
    return () => window.clearTimeout(id);
  }, [safeActive, inView, paused, reducedMotion, count]);

  const step = (dir: 1 | -1) => {
    setActive((prev) => {
      const cur = prev < count ? prev : 0;
      return (cur + dir + count) % count;
    });
  };

  const isIdle = !inView || paused || reducedMotion;

  return (
    <div
      ref={rootRef}
      className={styles.root}
      data-paused={isIdle ? "" : undefined}
      style={{ "--n": count, "--step-ms": `${STEP_MS}ms` } as CSSProperties}
      role="region"
      aria-roledescription="carousel"
      aria-label={t("region")}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          step(-1);
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          step(1);
        }
      }}
    >
      {/* Dải chấm + năm thu gọn, căn mốc đang chọn ra chính giữa */}
      <div ref={viewportRef} className={styles.viewport}>
        <ol className={styles.track}>
          {items.map((item, i) => {
            const isActive = i === safeActive;
            const state = i < safeActive ? "past" : isActive ? "active" : "future";
            return (
              <li
                key={i}
                className={styles.item}
                data-state={state}
                onClick={() => setActive(i)}
              >
                <span aria-hidden="true" className={styles.line}>
                  <span key={isActive ? `fill-${safeActive}` : "idle"} className={styles.lineFill} />
                </span>
                <button
                  type="button"
                  className={styles.trigger}
                  aria-expanded={isActive}
                  aria-current={isActive ? "step" : undefined}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActive(i);
                  }}
                >
                  <span aria-hidden="true" className={styles.dot} />
                  <h3 className={cn(styles.title, YEAR.test(item.t) && styles.year)}>{item.t}</h3>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Khung hiển thị nội dung ở chính giữa ngay dưới mốc đang chọn */}
      <div
        className={styles.stage}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
      >
        <div className={styles.stageGrid}>
          {items.map((item, i) => {
            const isActive = i === safeActive;
            return (
              <div
                key={i}
                className={styles.card}
                data-active={isActive ? "" : undefined}
                aria-hidden={!isActive}
              >
                {item.d && <p className={styles.desc}>{item.d}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


