"use client";

import { useEffect, useState } from "react";
import { ImagePlaceholder } from "@/components/content-block/image-placeholder";

export interface MarqueeItem {
  src?: string;
  alt: string;
}

export function Marquee({ items }: { items: MarqueeItem[] }) {
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div
      className="overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className={`flex gap-4 ${
          reducedMotion ? "" : "animate-marquee"
        } ${paused ? "[animation-play-state:paused]" : ""}`}
      >
        {items.map((item, i) =>
          item.src ? (
            <img
              key={i}
              src={item.src}
              alt={item.alt}
              className="h-48 w-64 shrink-0 object-cover"
            />
          ) : (
            <ImagePlaceholder
              key={i}
              label={item.alt}
              className="h-48 w-64 shrink-0"
            />
          )
        )}
      </div>
    </div>
  );
}
