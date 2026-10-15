import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { JsonLd } from "@/components/seo/json-ld";
import { Link } from "@/i18n/navigation";
import { getJobBySlug } from "@/lib/api/jobs";
import { getSiteSettings } from "@/lib/api/site-settings";
import { hasLocale } from "@/lib/i18n/config";
import { splitParagraphs } from "@/lib/jobs/text";
import { brandName } from "@/lib/site/contact-info";
import { breadcrumbJsonLd, jobPostingJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { SITE_URL } from "@/lib/seo/site-url";

type Props = { params: Promise<{ lang: string; slug: string }> };

// Việc mới (đăng sau lúc build) được dựng theo yêu cầu rồi cache 60 giây.
export const dynamicParams = true;

// Trả [] có chủ đích: lúc build không phụ thuộc trạng thái API (danh sách còn nhưng chi tiết lỗi
// sẽ làm hỏng build). Mỗi trang được dựng ở lần truy cập đầu rồi cache, tái dựng mỗi 60 giây (ISR).
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const result = await getJobBySlug(slug);
  if (result.status !== "ok") return { robots: { index: false, follow: false } };
  const job = result.data;
  const t = await getTranslations({ locale: lang, namespace: "Meta" });
  const description = splitParagraphs(job.description)[0]?.slice(0, 160) ?? t("careers.description");
  // Dữ liệu việc làm chỉ có tiếng Việt (spec R9): bản en trỏ canonical về bản vi, không hreflang.
  return buildMetadata({
    lang,
    path: `/careers/${encodeURIComponent(slug)}`,
    title: job.title,
    description,
    siteName: t("siteName"),
    siteUrl: SITE_URL,
    languages: [],
    canonicalLang: "vi",
  });
}

export default async function JobDetailPage({ params }: Props) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();

  const result = await getJobBySlug(slug);
  if (result.status === "not-found") notFound();
  // Lỗi tạm thời: ném để error boundary xử lý (Task 9); Next giữ bản cache cũ nếu có.
  if (result.status === "error") throw new Error(`Không tải được vị trí ${slug}`);

  const job = result.data;
  const [t, common, meta, settings] = await Promise.all([
    getTranslations({ locale: lang, namespace: "Careers" }),
    getTranslations({ locale: lang, namespace: "Common" }),
    getTranslations({ locale: lang, namespace: "Meta" }),
    getSiteSettings(),
  ]);
  const paragraphs = splitParagraphs(job.description);
  const url = `${SITE_URL}/${lang}/careers/${encodeURIComponent(slug)}`;
  // JobPosting chỉ phát ở bản vi để không trùng với bản en (cùng nội dung tiếng Việt).
  const posting =
    lang === "vi"
      ? jobPostingJsonLd({ siteUrl: SITE_URL, url, job, brand: brandName(settings, meta("siteName")) })
      : null;

  return (
    <article>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: common("home"), url: `${SITE_URL}/${lang}` },
          { name: meta("careers.title"), url: `${SITE_URL}/${lang}/careers` },
          { name: job.title, url },
        ])}
      />
      {posting && <JsonLd data={posting} />}

      <PageHero
        narrow
        before={
          <Link href="/careers" className="mb-6 inline-block text-sm text-muted-foreground hover:text-primary">
            {t("detail.back")}
          </Link>
        }
        title={job.title}
      />

      <PageSection>
        <div className="max-w-3xl">
          <dl className="grid grid-cols-1 gap-4 rounded-3xl border border-border bg-card p-6 text-sm sm:grid-cols-3">
            {(
              [
                ["department", job.department],
                ["location", job.location],
                ["type", job.type],
              ] as const
            ).map(([key, value]) => (
              <div key={key}>
                <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {t(`detail.${key}`)}
                </dt>
                <dd className="mt-1 text-base font-medium">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 space-y-5 text-[1.05rem] leading-8 text-foreground/90">
            {paragraphs.length > 0 ? (
              paragraphs.map((text, i) => (
                <p key={i} className="whitespace-pre-line">{text}</p>
              ))
            ) : (
              <p className="text-muted-foreground">{t("detail.noDescription")}</p>
            )}
          </div>

          <div className="mt-8 rounded-3xl border border-border bg-muted/20 p-6">
            <p className="mb-4 text-sm text-muted-foreground">{t("detail.applyNote")}</p>
            <Link
              href={`/contact?topic=careers&job=${encodeURIComponent(job.title)}`}
              className="inline-block rounded-full bg-foreground px-8 py-4 font-semibold text-background transition-colors hover:bg-primary hover:text-white"
            >
              {t("apply")}
            </Link>
          </div>
        </div>
      </PageSection>
    </article>
  );
}
