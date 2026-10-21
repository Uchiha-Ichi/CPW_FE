"use client";

import { useEffect, useRef } from "react";
import styles from "./fingerprint.module.css";

interface FingerprintCanvasProps {
  line1: string;
  line2: string;
}

function parseColor(raw: string): [number, number, number] {
  const s = raw.trim();
  if (s.startsWith("#")) {
    const hex = s.slice(1);
    if (hex.length === 3) {
      return [
        parseInt(hex[0] + hex[0], 16),
        parseInt(hex[1] + hex[1], 16),
        parseInt(hex[2] + hex[2], 16),
      ];
    }
    if (hex.length === 6) {
      return [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
      ];
    }
  }
  const m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];
  return [0, 102, 255];
}

export function FingerprintCanvas({ line1, line2 }: FingerprintCanvasProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const l1Ref = useRef<HTMLSpanElement>(null);
  const l2Ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const st = stageRef.current;
    const cv = canvasRef.current;
    const l1 = l1Ref.current;
    const l2 = l2Ref.current;
    if (!st || !cv || !l1 || !l2) return;

    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let fpRaf = 0;
    let fpObs: IntersectionObserver | null = null;
    let fpRO: ResizeObserver | null = null;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const N = 22, M = 150, NB = 12, TAU = Math.PI * 2;
    const ring = new Array(N);
    [...Array(N).keys()]
      .sort((a, b) => Math.abs(a - (N - 1) / 2) - Math.abs(b - (N - 1) / 2) || a - b)
      .forEach((i, k) => {
        ring[i] = k;
      });

    const clamp = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
    const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

    let W = 0, H = 0, cx = 0, cy = 0, R = 0, sep = 0, vis = false, cur = reduce ? 1 : 0;
    const t0 = performance.now();

    // Đọc màu --vcb-ed-blue một lần từ CSS
    const rawBlue = getComputedStyle(document.documentElement).getPropertyValue("--vcb-ed-blue");
    const [br, bg, bb] = parseColor(rawBlue || "#0066FF");
    const blueRgb = `${br},${bg},${bb}`;

    const layout = () => {
      const r = st.getBoundingClientRect();
      if (!r.width) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width;
      H = r.height;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const lh = l1.offsetHeight;
      cx = W / 2;
      cy = H / 2;
      R = Math.max(70, Math.min(W * 0.34, (H - 2 * lh - 52) / 2.08));
      sep = R * 1.02 + 7;
    };

    const target = () => {
      const r = st.getBoundingClientRect();
      const vh = window.innerHeight;
      return clamp((vh - r.top) / ((vh + r.height) / 2));
    };

    const wave = (i: number, u: number, t: number, gap: number, amp: number) =>
      cy +
      (i - (N - 1) / 2) * gap +
      amp * Math.sin(u * 10 + i * 0.45 + t * 0.6) +
      amp * 0.45 * Math.sin(u * 19.5 - t * 0.4 + i * 1.3);

    const frame = (now: number) => {
      if (!W) return;
      const t = reduce ? 4 : (now - t0) / 1000;
      if (!reduce) cur += (target() - cur) * 0.07;
      const p1 = ease(clamp(cur / 0.55));
      const p2 = ease(clamp((cur - 0.5) / 0.45));

      // Chữ
      l1.style.transform = `translateY(${(-sep * p2).toFixed(1)}px)`;
      // D16: letter-spacing giãn ra theo p1
      l1.style.letterSpacing = (-0.035 + 0.06 * p1).toFixed(4) + "em";
      l2.style.transform = `translateY(${(sep * p2).toFixed(1)}px)`;
      const mix = (a: number, b: number) => Math.round(a + (b - a) * p2);
      l2.style.color = `rgb(${mix(163, br)},${mix(174, bg)},${mix(192, bb)})`;
      l2.style.textShadow = `0 0 10px var(--background), 0 0 28px rgba(${blueRgb},${(0.32 * p2).toFixed(2)})`;

      ctx.clearRect(0, 0, W, H);

      // Lớp sau: sóng mảnh trôi chậm (chiều sâu)
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(${blueRgb},.07)`;
      ctx.beginPath();
      for (let b = 0; b < NB; b++) {
        const y0 = (H * (b + 0.5)) / NB + (cur - 0.5) * 24;
        for (let j = 0; j <= 80; j++) {
          const u = j / 80;
          const x = u * W;
          const y = y0 + 9 * Math.sin(u * 7 + b * 0.8 + t * 0.25);
          if (j) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        }
      }
      ctx.stroke();

      // Quầng sáng sau vân tay
      if (p2 > 0.01) {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.7);
        g.addColorStop(0, `rgba(${blueRgb},${(0.13 * p2).toFixed(3)})`);
        g.addColorStop(1, `rgba(${blueRgb},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(cx - R * 1.7, cy - R * 1.7, R * 3.4, R * 3.4);
      }

      // Lớp trước: đường sóng → mạng lưới → vân tay
      const gap = (H * (0.4 + 0.66 * p1)) / N;
      const amp = 5 + 14 * p1;
      const rot = -0.16 + (reduce ? 0 : 0.07 * Math.sin(t * 0.35));
      const sx = reduce ? 1 : 0.84 + 0.16 * Math.cos(t * 0.5);
      const cr = Math.cos(rot);
      const sr = Math.sin(rot);

      // Vệt sáng lướt ngang qua vân tay như bề mặt vừa được đánh bóng
      const sh = reduce ? 0.55 : ((t * 0.22) % 1.7) - 0.35;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (let i = 0; i < N; i++) {
        const k = ring[i];
        const kf = k / (N - 1);
        const rr = R * (0.1 + 0.9 * kf);
        const gapW = 0.35 + 0.9 * (0.5 + 0.5 * Math.sin(k * 2.3 + 1));
        const gapC = Math.PI / 2 + 0.55 * Math.sin(k * 1.7);
        const span = TAU - gapW;
        const th0 = gapC + gapW / 2;
        const a = 0.17 + 0.12 * p1 + 0.62 * p2 * (1 - 0.3 * kf);

        if (p2 > 0.02) {
          const g = ctx.createLinearGradient(cx - R, 0, cx + R, 0);
          const b0 = `rgba(${blueRgb},${a.toFixed(3)})`;
          const hi = `rgba(110,215,255,${Math.min(1, a + 0.35 * p2).toFixed(3)})`;
          g.addColorStop(0, b0);
          if (sh - 0.14 > 0 && sh - 0.14 < 1) g.addColorStop(sh - 0.14, b0);
          if (sh > 0 && sh < 1) g.addColorStop(sh, hi);
          if (sh + 0.14 > 0 && sh + 0.14 < 1) g.addColorStop(sh + 0.14, b0);
          g.addColorStop(1, b0);
          ctx.strokeStyle = g;
        } else {
          ctx.strokeStyle = `rgba(${blueRgb},${a.toFixed(3)})`;
        }

        ctx.beginPath();
        for (let j = 0; j <= M; j++) {
          const u = j / M;
          const ax = -0.04 * W + u * 1.08 * W;
          const ay = wave(i, u, t, gap, amp);
          let x = ax;
          let y = ay;
          if (p2 > 0) {
            const th = th0 + u * span;
            const rad = rr * (1 + 0.025 * Math.sin(2 * th + k * 0.4));
            const bx = rad * Math.cos(th) * 0.76;
            const by = rad * Math.sin(th);
            const fx = cx + (bx * cr - by * sr) * sx;
            const fy = cy + bx * sr + by * cr;
            x = ax + (fx - ax) * p2;
            y = ay + (fy - ay) * p2;
          }
          if (j) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        }

        // Quầng sáng: một nét rộng mờ vẽ trước nét chính (rẻ hơn shadowBlur nhiều)
        if (p2 > 0.02) {
          const keep = ctx.strokeStyle;
          ctx.strokeStyle = `rgba(${blueRgb},${(0.07 * p2).toFixed(3)})`;
          ctx.lineWidth = 5.5;
          ctx.stroke();
          ctx.strokeStyle = keep;
        }
        ctx.lineWidth = 1 + 0.8 * p2;
        ctx.stroke();
      }

      // Nút và dây nối của mạng lưới (chỉ ở nhịp 2)
      const na = p1 * (1 - p2);
      if (na > 0.02) {
        ctx.strokeStyle = `rgba(${blueRgb},${(0.22 * na).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        const K = 11;
        for (let i = 0; i < N - 1; i++) {
          for (let q = 0; q < K; q++) {
            if ((i + q) % 3) continue;
            const u = (q + 0.5) / K;
            const x = -0.04 * W + u * 1.08 * W;
            ctx.moveTo(x, wave(i, u, t, gap, amp));
            ctx.lineTo(x, wave(i + 1, u, t, gap, amp));
          }
        }
        ctx.stroke();

        ctx.fillStyle = `rgba(${blueRgb},${(0.6 * na).toFixed(3)})`;
        ctx.beginPath();
        for (let i = 0; i < N; i++) {
          for (let q = 0; q < K; q++) {
            if ((i + q) % 3) continue;
            const u = (q + 0.5) / K;
            const x = -0.04 * W + u * 1.08 * W;
            const y = wave(i, u, t, gap, amp);
            ctx.moveTo(x + 2.4, y);
            ctx.arc(x, y, 2.4, 0, TAU);
          }
        }
        ctx.fill();
      }
    };

    const loop = (now: number) => {
      if (!vis) {
        fpRaf = 0;
        return;
      }
      frame(now);
      fpRaf = requestAnimationFrame(loop);
    };

    layout();

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        layout();
        if (reduce) frame(performance.now());
      });
    }

    if (reduce) {
      frame(performance.now());
    } else {
      fpObs = new IntersectionObserver(
        (es) => {
          const e = es[es.length - 1];
          vis = e.isIntersecting;
          if (vis && !fpRaf) fpRaf = requestAnimationFrame(loop);
        },
        { rootMargin: "80px 0px" }
      );
      fpObs.observe(st);
    }

    if ("ResizeObserver" in window) {
      fpRO = new ResizeObserver(() => {
        layout();
        if (reduce) frame(performance.now());
      });
      fpRO.observe(st);
    }

    return () => {
      if (fpRaf) cancelAnimationFrame(fpRaf);
      fpObs?.disconnect();
      fpRO?.disconnect();
    };
  }, []);

  return (
    <div ref={stageRef} className={styles.stage}>
      <canvas ref={canvasRef} aria-hidden="true" className={styles.canvas} />
      <h2 className={styles.txt}>
        <span ref={l1Ref} className={styles.l1}>
          {line1}
        </span>
        <span ref={l2Ref} className={styles.l2}>
          {line2}
        </span>
      </h2>
    </div>
  );
}
