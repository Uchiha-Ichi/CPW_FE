"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Image from "next/image";
import styles from "./network.module.css";
import { cn } from "@/lib/utils";
import {
  HUB_CODE,
  MAP_CROP,
  MAP_CROP_ASPECT,
  MAP_MASK_POSITION_Y,
  MAP_SOURCE,
  type Pin,
  type RouteKind,
} from "@/lib/blocks/network-geometry";

const ROUTE_CLASS: Record<RouteKind, string> = {
  cross: styles.cross,
  reach: styles.reach,
  "next-next": styles.nextNext,
  "hub-next": styles.hubNext,
  "hub-live": styles.hubLive,
};

type MapPin = Pin & { label: string; crop: { x: number; y: number } | null };

export function NetworkMap({
  pins,
  routes,
  mapLabel,
  mapCredit,
}: {
  pins: MapPin[];
  routes: { key: string; kind: RouteKind; d: string }[];
  mapLabel?: string;
  mapCredit: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Vẽ dần đường bay một lần khi khung vào màn hình. Reduced-motion thì không đặt gì (đường vẽ sẵn).
  useEffect(() => {
    const frame = frameRef.current;
    const svg = svgRef.current;
    if (!frame || !svg) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }
    const paths = Array.from(svg.querySelectorAll("path"));
    // Ẩn đường cho tới lúc vào màn hình (chưa có JS thì đường vẫn hiện đủ).
    svg.setAttribute("data-armed", "");
    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName !== "stroke-dashoffset" || !(e.target instanceof SVGPathElement)) return;
      e.target.style.removeProperty("stroke-dasharray");
      e.target.style.removeProperty("stroke-dashoffset");
    };
    svg.addEventListener("transitionend", onEnd);
    const observer = new IntersectionObserver(
      (entries) => {
        // Lấy entry cuối: ([entry]) chập chờn khi cuộn nhanh.
        const entry = entries[entries.length - 1];
        // isIntersecting đổi ngay từ pixel đầu tiên nên phải tự kiểm ngưỡng 0.3.
        if (!entry.isIntersecting || entry.intersectionRatio < 0.3) return;
        observer.disconnect();
        // non-scaling-stroke: nét đứt tính theo pixel màn hình nên nhân độ dài (hệ 950) với tỷ lệ hiển thị.
        const scale = svg.clientWidth / MAP_SOURCE.width;
        for (const p of paths) {
          const len = p.getTotalLength() * scale;
          p.style.strokeDasharray = `${len}`;
          p.style.strokeDashoffset = `${len}`;
        }
        svg.removeAttribute("data-armed");
        svg.getBoundingClientRect(); // chốt trạng thái đầu rồi mới bật transition
        svg.setAttribute("data-drawing", "");
        for (const p of paths) p.style.strokeDashoffset = "0";
      },
      { threshold: 0.3 },
    );
    observer.observe(frame);
    return () => {
      observer.disconnect();
      svg.removeEventListener("transitionend", onEnd);
    };
  }, []);

  const placed = pins.filter((p): p is MapPin & { crop: { x: number; y: number } } => p.crop !== null);

  return (
    <>
      <div className={styles.mapbox}>
        <div ref={frameRef} className={styles.frame} style={{ aspectRatio: MAP_CROP_ASPECT }}>
          {/* Lớp trang trí không focus được: đất, đường bay, cờ. Các chấm là anh em của lớp này để không nằm trong role="img"/aria-hidden. */}
          <div
            className={styles.deco}
            {...(mapLabel ? { role: "img", "aria-label": mapLabel } : { "aria-hidden": true })}
          >
            <div className={styles.landWrap}>
              <div
                className={styles.land}
                style={{
                  WebkitMaskPosition: `0 ${MAP_MASK_POSITION_Y}%`,
                  maskPosition: `0 ${MAP_MASK_POSITION_Y}%`,
                }}
              />
            </div>
            <svg
              ref={svgRef}
              className={styles.routes}
              viewBox={`0 0 ${MAP_SOURCE.width} ${MAP_CROP.height}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {routes.map((r) => (
                <path key={r.key} className={cn(styles.route, ROUTE_CLASS[r.kind])} d={r.d} />
              ))}
            </svg>
            <div className={styles.flags}>
              {placed
                .filter((pin) => pin.stage === "live")
                .map((pin) => (
                  <span
                    key={pin.code}
                    className={cn(styles.mapFlag, pin.code === HUB_CODE && styles.hubFlag)}
                    style={{ "--x": `${pin.crop.x}%`, "--y": `${pin.crop.y}%` } as CSSProperties}
                  >
                    <Image
                      src={`https://flagcdn.com/w40/${pin.code}.png`}
                      alt=""
                      width={40}
                      height={30}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  </span>
                ))}
            </div>
          </div>

          {placed.map((pin) => (
            <div
              key={pin.code}
              className={cn(
                styles.dot,
                pin.code === HUB_CODE ? styles.hub : pin.stage === "next" ? styles.dotNext : styles.dotLive,
              )}
              style={{ left: `${pin.crop.x}%`, top: `${pin.crop.y}%` }}
              tabIndex={0}
              role="img"
              aria-label={pin.label}
            >
              <span className={styles.tip} aria-hidden="true">
                {pin.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className={styles.credit}>
        {mapCredit}{" "}
        <a
          href="https://creativecommons.org/licenses/by-sa/3.0/"
          target="_blank"
          rel="noopener noreferrer"
        >
          (license)
        </a>
      </p>
    </>
  );
}
