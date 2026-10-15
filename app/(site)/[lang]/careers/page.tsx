import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/blocks/shared/reveal";
import { SectionHead } from "@/components/blocks/shared/section-head";
import { ApplicationForm } from "@/components/careers/application-form";
import { ApplyProvider } from "@/components/careers/apply-context";
import { DepartmentFilter } from "@/components/careers/department-filter";
import { JobList } from "@/components/careers/job-list";
import { PageCta } from "@/components/layout/page-cta";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { JsonLd } from "@/components/seo/json-ld";
import { getJobs } from "@/lib/api/jobs";
import { hasLocale } from "@/lib/i18n/config";
import { buildCareersQuery, filterJobsByDepartment, parseDepartment } from "@/lib/jobs/constants";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { SITE_URL } from "@/lib/seo/site-url";

type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ department?: string | string[] }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const department = parseDepartment((await searchParams).department);
  const [t, result] = await Promise.all([
    getTranslations({ locale: lang, namespace: "Meta" }),
    getJobs(),
  ]);
  return buildMetadata({
    lang,
    path: "/careers",
    query: buildCareersQuery({ department }),
    title: t("careers.title"),
    description: t("careers.description"),
    siteName: t("siteName"),
    siteUrl: SITE_URL,
    noindex: department !== undefined || result.status !== "ok" || result.data.length === 0,
  });
}

export default async function CareersPage({ params, searchParams }: Props) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const department = parseDepartment((await searchParams).department);

  const [t, common, meta, result] = await Promise.all([
    getTranslations({ locale: lang, namespace: "Careers" }),
    getTranslations({ locale: lang, namespace: "Common" }),
    getTranslations({ locale: lang, namespace: "Meta" }),
    getJobs(),
  ]);

  const allJobs = result.status === "ok" ? result.data : [];
  const jobs = filterJobsByDepartment(allJobs, department);
  const emphasis = {
    em: (chunks: React.ReactNode) => <em className="not-italic text-primary">{chunks}</em>,
  };
  const labels = {
    all: t("all"),
    business: t("departments.business"),
    creative: t("departments.creative"),
    operations: t("departments.operations"),
    technology: t("departments.technology"),
  };
  const rowLabels = {
    apply: t("row.apply"),
    viewPage: t("row.viewPage"),
    noDescription: t("detail.noDescription"),
  };

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: common("home"), url: `${SITE_URL}/${lang}` },
          { name: meta("careers.title"), url: `${SITE_URL}/${lang}/careers` },
        ])}
      />

      <PageHero eyebrow={t("eyebrow")} title={t.rich("title", emphasis)} lead={t("lead")}>
        <ul className="flex flex-wrap gap-3">
          {(["vn", "us", "th", "jp", "team"] as const).map((key) => (
            <li
              key={key}
              className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium"
            >
              {t(`chips.${key}`)}
            </li>
          ))}
        </ul>
      </PageHero>

      <ApplyProvider>
        <PageSection>
          <Reveal>
            <SectionHead eyebrow={t("listEyebrow")} title={t("listTitle")} />
          </Reveal>
          <DepartmentFilter active={department} label={t("filterLabel")} labels={labels} />

          <div className="mt-8">
            {result.status === "error" ? (
              <p role="status" className="py-12 text-muted-foreground">{t("error")}</p>
            ) : jobs.length === 0 ? (
              <p className="py-12 text-muted-foreground">
                {department ? t("emptyFiltered") : t("empty")}
              </p>
            ) : (
              <JobList jobs={jobs} labels={rowLabels} />
            )}
          </div>
        </PageSection>

        <ApplicationForm lang={lang} />
      </ApplyProvider>

      <PageSection>
        <Reveal>
          <SectionHead eyebrow={t("cultureEyebrow")} title={t("cultureTitle")} />
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {(["one", "two", "three"] as const).map((key, i) => (
            <Reveal key={key} className="h-full">
              <div className="h-full rounded-3xl border border-border bg-card p-8">
                <span aria-hidden className="mb-2 block text-4xl font-bold text-muted-foreground/30">
                  {`0${i + 1}`}
                </span>
                <h3 className="text-xl font-bold leading-[1.2] md:text-2xl">{t(`culture.${key}.title`)}</h3>
                <p className="mt-4 leading-relaxed text-muted-foreground">{t(`culture.${key}.text`)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </PageSection>

      <PageCta title={t.rich("ctaTitle", emphasis)} href="/contact?topic=careers" label={t("apply")} />
    </>
  );
}
