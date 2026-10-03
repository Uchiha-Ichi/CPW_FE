import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { ApplicationFormFields } from "@/components/careers/application-form-fields";
import { getJobs } from "@/lib/api/jobs";
import type { Locale } from "@/lib/i18n/config";

const eyebrow =
  "flex items-center gap-3 text-[0.8rem] font-semibold uppercase tracking-widest text-muted-foreground";

export async function ApplicationForm({ lang }: { lang: Locale }) {
  const [t, messages, jobsResult] = await Promise.all([
    getTranslations({ locale: lang, namespace: "Careers.application" }),
    getMessages({ locale: lang }),
    getJobs(),
  ]);
  // Lỗi tải job: vẫn cho nộp hồ sơ được, chỉ còn mục "Khác" trong dropdown vị trí.
  const jobTitles = jobsResult.status === "ok" ? jobsResult.data.map((job) => job.title) : [];

  return (
    <section className="border-b border-border py-20 md:py-32">
      <div className="mx-auto max-w-[1240px] px-4">
        <div className="grid gap-12 border border-border bg-card p-8 md:p-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <div className={`${eyebrow} mb-6`}>
              <span className="h-2 w-2 rounded-full bg-primary/60 shadow-[0_0_0_5px_rgba(23,125,242,0.1)]" />
              {t("eyebrow")}
            </div>
            <h2 className="mb-5 max-w-[10ch] font-display text-4xl font-medium leading-[1.1] md:text-5xl">
              {t("title")}
            </h2>
            <p className="max-w-[38ch] leading-relaxed text-muted-foreground">{t("lead")}</p>
          </div>

          {/* Chỉ gửi xuống client nhóm chữ mà form dùng. */}
          <NextIntlClientProvider
            messages={{
              Careers: { application: messages.Careers.application },
            }}
          >
            <ApplicationFormFields jobTitles={jobTitles} />
          </NextIntlClientProvider>
        </div>
      </div>
    </section>
  );
}
