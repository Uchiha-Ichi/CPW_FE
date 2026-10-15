import { BRAND_PATHS, type BrandKey } from "./brand-paths";

// Màu chính của từng nền tảng. undefined = logo đơn sắc đen/trắng, tô theo màu chữ của giao diện (sáng/tối).
export const BRAND_COLOR: Record<BrandKey, string | undefined> = {
  facebook: "#0866FF",
  instagram: "#D62976",
  tiktok: undefined,
  youtube: "#FF0000",
  threads: undefined,
  zalo: "#0068FF",
  x: undefined,
  linkedin: "#0A66C2",
};

// Nhận ra nền tảng từ tên admin gõ ("Facebook", "Fanpage Facebook", "TikTok"...). Bỏ dấu và khoảng trắng rồi so
// khớp; "x" quá ngắn nên chỉ nhận khi tên đúng là "x" hoặc "twitter". Không nhận ra thì trả undefined (hiện chữ cái đầu).
export function brandKey(name: string): BrandKey | undefined {
  const k = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  if (k === "x" || k === "twitter") return "x";
  const found = (["facebook", "instagram", "tiktok", "youtube", "threads", "zalo", "linkedin"] as const).find((b) =>
    k.includes(b),
  );
  if (found) return found;
  return k === "fb" ? "facebook" : undefined;
}

const GRADIENT_ID = "vcb-brand-instagram";

// Logo thương hiệu bằng SVG nội tuyến. Màu logo: màu chính của nền tảng (Instagram dùng dải màu chính thức),
// hoặc currentColor với logo đơn sắc.
export function BrandLogo({ brand, className }: { brand: BrandKey; className?: string }) {
  const color = BRAND_COLOR[brand];
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill={brand === "instagram" ? `url(#${GRADIENT_ID})` : (color ?? "currentColor")}>
      {brand === "instagram" && (
        <defs>
          <linearGradient id={GRADIENT_ID} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#FEDA75" />
            <stop offset="0.25" stopColor="#FA7E1E" />
            <stop offset="0.5" stopColor="#D62976" />
            <stop offset="0.75" stopColor="#962FBF" />
            <stop offset="1" stopColor="#4F5BD5" />
          </linearGradient>
        </defs>
      )}
      <path d={BRAND_PATHS[brand]} />
    </svg>
  );
}
