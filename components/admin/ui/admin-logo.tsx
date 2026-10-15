import Image from "next/image";
import { cn } from "@/lib/utils";

// public/logo.png là 1788×1787 với lề trong suốt rất rộng. Cắt lề bằng CSS (không thêm file ảnh):
// khung có đúng tỉ lệ vùng nội dung, ảnh phóng to và dịch lại. Số đo bbox (px) đo bằng PIL ngày 2026-10-08:
//   full (hoa + chữ): x 253–1534, y 317–1425 → 1281×1108
//   mark (chỉ hoa):   x 419–1356, y 317–1253 → 937×936
const SRC_W = 1788;
const SRC_H = 1787;
const BBOX = {
  full: { l: 253, t: 317, w: 1281, h: 1108 },
  mark: { l: 419, t: 317, w: 937, h: 936 },
} as const;

export function AdminLogo({
  variant = "full",
  className,
}: {
  variant?: keyof typeof BBOX;
  /** Đặt bề rộng ở đây (ví dụ `w-40`); chiều cao theo tỉ lệ. */
  className?: string;
}) {
  const b = BBOX[variant];
  return (
    <span
      className={cn("relative block overflow-hidden", className)}
      style={{ aspectRatio: `${b.w} / ${b.h}` }}
    >
      <Image
        src="/logo.png"
        alt="Viễn Chí Bảo"
        width={SRC_W}
        height={SRC_H}
        sizes="(max-width: 760px) 280px, 560px"
        className="absolute h-auto max-w-none"
        style={{
          width: `${(SRC_W / b.w) * 100}%`,
          left: `${(-b.l / b.w) * 100}%`,
          top: `${(-b.t / b.h) * 100}%`,
        }}
      />
    </span>
  );
}
