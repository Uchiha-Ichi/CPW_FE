import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import "../../globals.css";
import { htmlClassName } from "@/lib/fonts";
import { THEME_INIT_SCRIPT } from "@/lib/theme/init-script";
import { hasLocale, locales } from "@/lib/i18n/config";
import { organizationJsonLd, webSiteJsonLd } from "@/lib/seo/json-ld";
import { SITE_URL } from "@/lib/seo/site-url";
import { getSiteSettings } from "@/lib/api/site-settings";
import { brandName } from "@/lib/site/contact-info";
import { JsonLd } from "@/components/seo/json-ld";
import { SilkFlow } from "@/components/shared/silk-flow";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { LenisProvider } from "@/components/layout/lenis-provider";
import { Toaster } from "@/components/ui/sonner";

type Props = { children: React.ReactNode; params: Promise<{ lang: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = await getTranslations({ locale: lang, namespace: "Meta" });
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t("siteName"), template: `%s | ${t("siteName")}` },
    description: t("siteDescription"),
  };
}

export default async function SiteLayout({ children, params }: Props) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const messages = await getMessages();
  const common = await getTranslations("Common");
  const meta = await getTranslations("Meta");
  const settings = await getSiteSettings();
  const brand = brandName(settings, meta("siteName"));

  return (
    <html lang={lang} className={htmlClassName} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex flex-col font-body">
        <SilkFlow className="pointer-events-none fixed inset-0 -z-10 h-full w-full text-[#C9A063]" />
        <JsonLd data={organizationJsonLd(SITE_URL, brand, settings)} />
        <JsonLd data={webSiteJsonLd(SITE_URL, brand)} />
        {/* Chỉ gửi xuống client các nhóm chữ mà client component dùng. */}
        <NextIntlClientProvider messages={{ Header: messages.Header, Carousel: messages.Carousel, Errors: messages.Errors }}>
          <LenisProvider>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-foreground"
            >
              {common("skipToContent")}
            </a>
            <SiteHeader />
            {/* padding-top = chiều cao header lúc chưa cuộn (72px mobile, 88px từ 880px) */}
            <main id="main" tabIndex={-1} className="flex-1 pt-[72px] min-[880px]:pt-[88px]">{children}</main>
            <SiteFooter />
            <Toaster />
          </LenisProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
