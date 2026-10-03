import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { BlockRenderer } from "@/components/blocks/block-renderer";
import { EmptyPage } from "@/components/blocks/empty-page";
import { getPublicPage } from "@/lib/api/pages";
import { JsonLd } from "@/components/seo/json-ld";
import { hasLocale } from "@/lib/i18n/config";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { SITE_URL } from "@/lib/seo/site-url";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const [t, page] = await Promise.all([
    getTranslations({ locale: lang, namespace: "Meta" }),
    getPublicPage("about", lang),
  ]);
  return buildMetadata({
    lang,
    path: "/about",
    title: t("about.title"),
    description: t("about.description"),
    siteName: t("siteName"),
    siteUrl: SITE_URL,
    noindex: page.status !== "ok" || page.data.blocks.length === 0,
  });
}

export default async function AboutPage({ params }: Props) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const page = await getPublicPage("about", lang);
  if (page.status === "error") return <EmptyPage variant="error" />;
  if (page.status !== "ok" || page.data.blocks.length === 0) return <EmptyPage />;
  const [meta, common] = await Promise.all([
    getTranslations({ locale: lang, namespace: "Meta" }),
    getTranslations({ locale: lang, namespace: "Common" }),
  ]);
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: common("home"), url: `${SITE_URL}/${lang}` },
          { name: meta("about.title"), url: `${SITE_URL}/${lang}/about` },
        ])}
      />
      <BlockRenderer blocks={page.data.blocks} lang={lang} />
    </>
  );
}
