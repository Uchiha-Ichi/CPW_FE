"use client";

import { useEffect, useRef } from "react";
import { BLOCK_SECTION, BLOCK_WRAP } from "@/lib/blocks/rhythm";
import { cn } from "@/lib/utils";
import styles from "./fingerprint.module.css";

interface RingCanvasProps {
  line1: string;
  line2: string;
}

// Mô hình nhẫn (thay nhẫn khác = thay file này, xem ring-model.ts).
const RING_URL = "/models/ring.glb";
// Ảnh môi trường studio (HDR, CC0 của Poly Haven) mà kim loại và đá phản chiếu.
const STUDIO_URL = "/models/studio.hdr";

// Chữ hai câu bên trái, chiếc nhẫn dựng bằng three.js bên phải. Chưa có JS, trình duyệt không có WebGL, hoặc không tải được
// file nhẫn: chỉ còn hai câu chữ (data-gl="off" thu gọn khung nhẫn). `three` và file nhẫn chỉ được tải khi section sắp lọt
// vào khung nhìn.
export function RingCanvas({ line1, line2 }: RingCanvasProps) {
  const secRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const lcvRef = useRef<HTMLCanvasElement>(null);
  const lensRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sec = secRef.current;
    const stage = stageRef.current;
    const cv = cvRef.current;
    const lcv = lcvRef.current;
    const lens = lensRef.current;
    const pointer = pointerRef.current;
    if (!sec || !stage || !cv || !lcv || !lens || !pointer) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cancelled = false;
    let dispose: (() => void) | null = null;
    let io: IntersectionObserver | null = null;

    const start = async () => {
      try {
        const [T3, { mountRingScene }, { loadRingParts }, data, studio] = await Promise.all([
          import("three"),
          import("./ring-scene"),
          import("./ring-model"),
          fetch(RING_URL).then((r) => {
            if (!r.ok) throw new Error(`${RING_URL}: HTTP ${r.status}`);
            return r.arrayBuffer();
          }),
          import("three/addons/loaders/HDRLoader.js").then(({ HDRLoader }) => new HDRLoader().loadAsync(STUDIO_URL)),
        ]);
        if (cancelled) {
          studio.dispose();
          return;
        }
        const rp = await loadRingParts(T3, data);
        if (cancelled) {
          rp.dispose();
          studio.dispose();
          return;
        }
        const cleanup = mountRingScene(
          T3,
          rp,
          studio,
          { sec, stage, cv, lcv, lens, pointer },
          { s1: styles.s1, s2: styles.s2, s3: styles.s3, lens: styles.lensOn },
          reduce,
        );
        if (!cleanup) {
          rp.dispose();
          studio.dispose();
          sec.dataset.gl = "off";
          return;
        }
        dispose = cleanup;
        if (!reduce) sec.dataset.armed = "true"; // từ đây chữ ẩn đi, chờ nhịp của cảnh mới hiện
      } catch (e) {
        console.warn("Không tải được mô hình nhẫn", e);
        if (!cancelled) sec.dataset.gl = "off";
      }
    };

    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (es) => {
          if (!es.some((e) => e.isIntersecting)) return;
          io?.disconnect();
          void start();
        },
        { rootMargin: "600px 0px" },
      );
      io.observe(sec);
    } else {
      void start();
    }

    return () => {
      cancelled = true;
      io?.disconnect();
      dispose?.();
      delete sec.dataset.armed;
      sec.classList.remove(styles.s1, styles.s2, styles.s3);
    };
  }, []);

  return (
    <section ref={secRef} className={cn(BLOCK_SECTION, styles.sec)}>
      <div className={cn(BLOCK_WRAP, styles.grid)}>
        <h2 className={styles.h}>
          <span className={styles.l1}>{line1}</span>
          <span className={styles.l2}>{line2}</span>
        </h2>
        <div ref={stageRef} className={styles.stage}>
          <div className={styles.shadow} />
          <canvas ref={cvRef} className={styles.cv} aria-hidden="true" />
          <div ref={lensRef} className={styles.lens} aria-hidden="true">
            <div className={styles.lgrid} />
            <canvas ref={lcvRef} className={styles.cv} />
          </div>
          <div ref={pointerRef} className={styles.pointer} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
