import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { BlockRenderer } from "@/components/blocks/block-renderer";
import { EmptyPage } from "@/components/blocks/empty-page";
import { getPublicPage } from "@/lib/api/pages";
import { hasLocale } from "@/lib/i18n/config";
import { buildMetadata } from "@/lib/seo/metadata";
import { SITE_URL } from "@/lib/seo/site-url";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const [t, page] = await Promise.all([
    getTranslations({ locale: lang, namespace: "Meta" }),
    getPublicPage("home", lang),
  ]);
  return buildMetadata({
    lang,
    path: "",
    title: t("home.title"),
    description: t("home.description"),
    siteName: t("siteName"),
    siteUrl: SITE_URL,
    absoluteTitle: true,
    noindex: page.status !== "ok" || page.data.blocks.length === 0,
  });
}

export default async function HomePage({ params }: Props) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const page = await getPublicPage("home", lang);
  if (page.status === "error") return <EmptyPage variant="error" />;
  if (page.status !== "ok" || page.data.blocks.length === 0) return <EmptyPage />;
  return <BlockRenderer blocks={page.data.blocks} lang={lang} />;
}
