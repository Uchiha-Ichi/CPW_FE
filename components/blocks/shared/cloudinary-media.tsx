"use client";

import { useEffect, useRef } from "react";
import type { ImageProps } from "next/image";
import { CloudinaryImage } from "./cloudinary-image";
import { cloudinaryVideoUrl } from "@/lib/images/cloudinary-loader";
import { isCloudinaryVideoUrl } from "@/lib/images/is-video-url";
import { cn } from "@/lib/utils";

interface CloudinaryMediaProps {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  variant: "loop" | "player";
  /** Chỉ áp dụng cho nhánh ảnh — forward xuống next/image (ví dụ hero-block cần preload/fetchPriority). */
  imageProps?: Partial<Omit<ImageProps, "src" | "alt" | "fill" | "sizes" | "className" | "loader">>;
}

const VIDEO_CLASS = "absolute inset-0 h-full w-full object-cover";

export function CloudinaryMedia({ src, alt, sizes, className, variant, imageProps }: CloudinaryMediaProps) {
  if (!isCloudinaryVideoUrl(src)) {
    return <CloudinaryImage src={src} alt={alt} fill sizes={sizes} className={className} {...imageProps} />;
  }
  return variant === "loop" ? (
    <LoopVideo src={src} alt={alt} className={className} />
  ) : (
    <video
      src={cloudinaryVideoUrl(src)}
      controls
      playsInline
      preload="metadata"
      aria-label={alt}
      className={cn(VIDEO_CLASS, className)}
    />
  );
}

function LoopVideo({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.play().catch(() => {});
  }, []);

  return (
    <video
      ref={ref}
      src={cloudinaryVideoUrl(src)}
      muted
      loop
      playsInline
      aria-label={alt}
      className={cn(VIDEO_CLASS, className)}
    />
  );
}
