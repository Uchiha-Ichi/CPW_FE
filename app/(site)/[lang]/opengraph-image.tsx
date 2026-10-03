import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { hasLocale, defaultLocale, locales } from "@/lib/i18n/config";

export const alt = "Viễn Chí Bảo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

// Ảnh OG mặc định của site. Next tự gắn ảnh này cho trang nào không khai báo `openGraph` riêng;
// trang dùng `buildMetadata` trỏ tới cùng ảnh qua URL cố định `/[lang]/og` (xem og/route.tsx).
export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : defaultLocale;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 96,
          background: "#050A14",
          color: "#F4F7FB",
        }}
      >
        <div style={{ fontSize: 30, letterSpacing: 6, color: "#58B7FF" }}>
          {t("siteName").toUpperCase()}
        </div>
        <div style={{ marginTop: 28, fontSize: 76, lineHeight: 1.15, fontWeight: 700 }}>
          {t("ogTagline")}
        </div>
      </div>
    ),
    size,
  );
}
