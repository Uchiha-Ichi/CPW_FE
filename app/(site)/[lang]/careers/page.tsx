import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ApplicationForm } from "@/components/careers/application-form";
import { DepartmentFilter } from "@/components/careers/department-filter";
import { JobRow } from "@/components/careers/job-row";
import { JsonLd } from "@/components/seo/json-ld";
import { Link } from "@/i18n/navigation";
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

const eyebrow =
  "flex items-center gap-3 text-[0.8rem] font-semibold uppercase tracking-widest text-muted-foreground";
const dot = "h-2 w-2 rounded-full bg-primary/60 shadow-[0_0_0_5px_rgba(23,125,242,0.1)]";

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

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: common("home"), url: `${SITE_URL}/${lang}` },
          { name: meta("careers.title"), url: `${SITE_URL}/${lang}/careers` },
        ])}
      />

      <section className="overflow-hidden border-b border-border bg-gradient-to-br from-background to-muted/20 pb-16 pt-24 md:pb-24 md:pt-32">
        <div className="mx-auto max-w-[1240px] px-4">
          <div className={`${eyebrow} mb-6`}>
            <span className={dot} />
            {t("eyebrow")}
          </div>
          <h1 className="mb-6 max-w-[16ch] text-5xl font-bold leading-[1.1] tracking-[-0.01em] md:text-6xl lg:text-7xl">
            {t.rich("title", emphasis)}
          </h1>
          <p className="mb-8 max-w-[45ch] text-lg leading-relaxed text-muted-foreground">{t("lead")}</p>
          <ul className="flex flex-wrap gap-3">
            {(["vn", "us", "th", "jp", "team"] as const).map((key) => (
              <li
                key={key}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium shadow-sm"
              >
                {t(`chips.${key}`)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-border py-20 md:py-32">
        <div className="mx-auto max-w-[1240px] px-4">
          <div className="mb-16 flex flex-col justify-between gap-8 border-b border-border pb-8 md:flex-row md:items-end">
            <div>
              <div className={`${eyebrow} mb-4`}>
                <span className={dot} />
                {t("listEyebrow")}
              </div>
              <h2 className="font-display text-4xl font-medium leading-[1.15] md:text-5xl">{t("listTitle")}</h2>
            </div>
            <DepartmentFilter active={department} label={t("filterLabel")} labels={labels} />
          </div>

          {result.status === "error" ? (
            <p role="status" className="py-12 text-center text-muted-foreground">{t("error")}</p>
          ) : jobs.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">
              {department ? t("emptyFiltered") : t("empty")}
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {jobs.map((job, index) => (
                <li key={job.slug}>
                  <JobRow job={job} index={index} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <ApplicationForm lang={lang} />

      <section className="border-b border-border bg-foreground py-20 text-background md:py-32">
        <div className="mx-auto max-w-[1240px] px-4">
          <div className="mb-16">
            <div className={`${eyebrow} mb-4`}>
              <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_5px_rgba(23,125,242,0.1)]" />
              {t("cultureEyebrow")}
            </div>
            <h2 className="max-w-[25ch] text-4xl font-bold leading-[1.15] tracking-[-0.01em] md:text-5xl">
              {t("cultureTitle")}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="relative flex min-h-[400px] flex-col justify-end overflow-hidden rounded-3xl border border-border/10 bg-background/5 p-10 md:p-14">
              <span aria-hidden className="absolute right-10 top-10 font-display text-6xl font-light text-background/10">01</span>
              <h3 className="mb-4 font-display text-3xl font-bold leading-[1.15]">{t("culture.one.title")}</h3>
              <p className="max-w-[30ch] leading-relaxed text-muted-foreground">{t("culture.one.text")}</p>
            </div>
            <div className="grid gap-6">
              {(["two", "three"] as const).map((key, i) => (
                <div key={key} className="relative overflow-hidden rounded-3xl border border-border/10 bg-background/5 p-8">
                  <span aria-hidden className="absolute right-8 top-8 font-display text-4xl font-light text-background/10">
                    {`0${i + 2}`}
                  </span>
                  <h3 className="mb-4 text-2xl font-bold leading-[1.2]">{t(`culture.${key}.title`)}</h3>
                  <p className="max-w-[40ch] leading-relaxed text-muted-foreground">{t(`culture.${key}.text`)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 text-center">
        <div className="mx-auto max-w-[800px] px-4">
          <h2 className="mb-12 text-5xl font-bold leading-[1.1] tracking-[-0.01em] md:text-6xl">
            {t.rich("ctaTitle", emphasis)}
          </h2>
          <Link
            href="/contact?topic=careers"
            className="inline-block rounded-full bg-foreground px-10 py-5 text-lg font-semibold text-background shadow-xl transition-colors hover:bg-primary hover:text-white"
          >
            {t("apply")}
          </Link>
        </div>
      </section>
    </>
  );
}
