"use client";

import { useEffect, useRef } from "react";
import { parseCountText } from "@/lib/blocks/count-text";
import type { Locale } from "@/lib/i18n/config";

// Số đầu chuỗi đếm lên khi cuộn tới ("2,5 tỷ+" → đếm 2,5 rồi giữ nguyên " tỷ+"). Server render nguyên chuỗi nên
// không có JS hoặc bật reduced-motion vẫn đọc đúng. Cùng hành vi CountUp của stats-block (không sửa CountUp).
export function CountText({ text, lang }: { text: string; lang: Locale }) {
  const ref = useRef<HTMLSpanElement>(null);
  const parsed = parseCountText(text, lang);

  useEffect(() => {
    const el = ref.current;
    const parts = parseCountText(text, lang);
    if (!el || !parts) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }
    const { value, decimals } = parts;
    const factor = Math.pow(10, decimals);
    const format = new Intl.NumberFormat(lang === "vi" ? "vi-VN" : "en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    el.textContent = format.format(0);
    let frame = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        // Lấy entry cuối: ([entry]) chập chờn khi cuộn nhanh.
        const entry = entries[entries.length - 1];
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const duration = 1400;
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = format.format(Math.round(value * eased * factor) / factor);
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
  }, [text, lang]);

  if (!parsed) return <>{text}</>;
  // key đổi theo text/lang để span được dựng lại: textContent do effect ghi làm mất liên kết với nút chữ của React.
  return (
    <>
      <span key={`${lang}:${text}`} ref={ref}>
        {text.slice(0, text.length - parsed.rest.length)}
      </span>
      {parsed.rest}
    </>
  );
}
