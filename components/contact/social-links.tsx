import type { ReactNode } from "react";
import { BRAND_PATHS } from "@/components/blocks/shared/brand-paths";
import type { SocialKey } from "@/lib/site/settings-model";
import type { VisibleSocial } from "@/lib/site/socials";

// Điện thoại và máy tính bảng (< 880px, cùng mốc với header): đệm 8px quanh icon để vùng chạm đạt ~40px; gap của hàng
// đổi thành 0 và -ml-2 bù lại để icon vẫn thẳng lề trái với chữ phía trên.
const linkClass =
  "opacity-80 hover:opacity-100 motion-safe:hover:scale-105 transition-opacity motion-safe:transition-transform max-[880px]:p-2";

// Màu ô nền của từng nền tảng; logo trắng nằm trong ô. TikTok và Threads là logo đơn sắc nên dùng ô đen.
// Instagram dùng dải màu riêng (gradient bên dưới) nên không có trong bảng này.
const TILE_FILL: Record<Exclude<SocialKey, "instagram">, string> = {
  zalo: "#0068ff",
  tiktok: "#111",
  facebook: "#0866ff",
  youtube: "#ff0000",
  threads: "#111",
};

// Đường vẽ logo lấy từ BRAND_PATHS (cùng nguồn với block Kênh), không tự vẽ lại từng nền tảng ở đây.
function SocialIcon({ name, size }: { name: SocialKey; size: number }): ReactNode {
  // id gradient gắn theo kích thước để hai bộ icon (footer 24px, trang liên hệ 32px) cùng trang không trùng id.
  const gradientId = `igGrad-${size}`;
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 40 40">
      {name === "instagram" && (
        <defs>
          <linearGradient id={gradientId} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#f58529" />
            <stop offset=".45" stopColor="#dd2a7b" />
            <stop offset="1" stopColor="#8134af" />
          </linearGradient>
        </defs>
      )}
      <rect x="5" y="5" width="30" height="30" rx="9" fill={name === "instagram" ? `url(#${gradientId})` : TILE_FILL[name]} />
      <svg x="10" y="10" width="20" height="20" viewBox="0 0 24 24" fill="#fff">
        <path d={BRAND_PATHS[name]} />
      </svg>
    </svg>
  );
}

export function SocialLinks({ items, size = 32 }: { items: VisibleSocial[]; size?: number }) {
  if (items.length === 0) return null;
  return (
    <div className="flex items-center gap-3 max-[880px]:-ml-2 max-[880px]:gap-0">
      {items.map((item) => (
        <a
          key={item.key}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
          aria-label={item.label}
          title={item.label}
        >
          <SocialIcon name={item.key} size={size} />
        </a>
      ))}
    </div>
  );
}
