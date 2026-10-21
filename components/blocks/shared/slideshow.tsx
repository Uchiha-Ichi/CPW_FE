import { cn } from "@/lib/utils";
import { CloudinaryMedia } from "./cloudinary-media";
import styles from "./slideshow.module.css";

// Mỗi ảnh hiện SLIDE_SECONDS, chuyển FADE_SECONDS (mockup BẢN 65 dòng 790–796). Chỉ CSS, không JS.
const SLIDE_SECONDS = 4.2;
const FADE_SECONDS = 1.1;
const MAX_IMAGES = 6;

// 1 ảnh đứng yên; 2–6 ảnh xếp chồng tự mờ chuyển (hơn 6 thì lấy 6 đầu). 0 ảnh: không render, nơi gọi tự trả ImageSlot.
// Khung nhận kích thước/bo góc qua className. Không preload vì khối nằm dưới màn hình đầu.
export function Slideshow({
  images,
  alt,
  sizes,
  className,
}: {
  images: string[];
  alt: string;
  sizes: string;
  className?: string;
}) {
  const list = images.slice(0, MAX_IMAGES);
  const n = list.length;
  if (n === 0) return null;

  return (
    <div className={cn(styles.root, className)}>
      {list.map((src, k) => (
        <div
          key={k}
          className={cn(styles.layer, n === 1 ? styles.still : styles[`n${n}`])}
          aria-hidden={k > 0 || undefined}
          style={
            n === 1
              ? undefined
              : {
                  animationDuration: `${(n * SLIDE_SECONDS).toFixed(1)}s`,
                  animationDelay: `${(k * SLIDE_SECONDS - FADE_SECONDS).toFixed(2)}s`,
                }
          }
        >
          {/* Chỉ lớp đầu có mô tả; lớp sau ẩn khỏi trình đọc màn hình (opacity 0 không loại khỏi cây truy cập). */}
          <CloudinaryMedia
            src={src}
            alt={k === 0 ? alt : ""}
            sizes={sizes}
            variant="loop"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
