import { locales } from "@/lib/i18n/config";
import OpenGraphImage from "../opengraph-image";

// URL cố định (không có hash build) cho ảnh OG mặc định, để `buildMetadata` gắn vào từng trang.
// Vẽ bằng đúng hàm của opengraph-image.tsx nên hai URL luôn ra cùng một ảnh.
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function GET(_request: Request, { params }: RouteContext<"/[lang]/og">) {
  return OpenGraphImage({ params });
}
