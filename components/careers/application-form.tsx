import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { SectionHead } from "@/components/blocks/shared/section-head";
import { ApplicationFormFields } from "@/components/careers/application-form-fields";
import { PageSection } from "@/components/layout/page-section";
import { getJobs } from "@/lib/api/jobs";
import type { Locale } from "@/lib/i18n/config";
import { APPLY_ANCHOR_ID } from "@/lib/jobs/constants";

export async function ApplicationForm({ lang }: { lang: Locale }) {
  const [t, messages, jobsResult] = await Promise.all([
    getTranslations({ locale: lang, namespace: "Careers.application" }),
    getMessages({ locale: lang }),
    getJobs(),
  ]);
  // Lỗi tải job: vẫn cho nộp hồ sơ được, chỉ còn mục "Khác" trong dropdown vị trí.
  const jobTitles = jobsResult.status === "ok" ? jobsResult.data.map((job) => job.title) : [];

  return (
    <PageSection tone="muted">
      {/* scroll-mt chừa chỗ cho header cố định (cao tối đa 88px) khi cuộn tới đây. */}
      <div id={APPLY_ANCHOR_ID} className="scroll-mt-28 grid gap-12 rounded-3xl border border-border bg-card p-8 md:p-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <SectionHead flush eyebrow={t("eyebrow")} title={t("title")} text={t("lead")} />

        {/* Chỉ gửi xuống client nhóm chữ mà form dùng. */}
        <NextIntlClientProvider
          messages={{
            Careers: { application: messages.Careers.application },
          }}
        >
          <ApplicationFormFields jobTitles={jobTitles} />
        </NextIntlClientProvider>
      </div>
    </PageSection>
  );
}
