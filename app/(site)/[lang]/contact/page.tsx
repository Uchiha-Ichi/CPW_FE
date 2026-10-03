import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/contact/contact-form";
import { SocialLinks } from "@/components/contact/social-links";
import { JsonLd } from "@/components/seo/json-ld";
import { parseJobParam, parseTopicParam } from "@/lib/contact/schema";
import { hasLocale } from "@/lib/i18n/config";
import { breadcrumbJsonLd, contactJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { SITE_URL } from "@/lib/seo/site-url";
import { getSiteSettings } from "@/lib/api/site-settings";
import { addressLine, brandName, mapsUrl, phoneToTel } from "@/lib/site/contact-info";
import { OFFICE_KEYS } from "@/lib/site/settings-model";
import { visibleSocials } from "@/lib/site/socials";

type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ topic?: string | string[]; job?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = await getTranslations({ locale: lang, namespace: "Meta" });
  return buildMetadata({
    lang,
    path: "/contact",
    title: t("contact.title"),
    description: t("contact.description"),
    siteName: t("siteName"),
    siteUrl: SITE_URL,
  });
}

const eyebrow =
  "flex items-center gap-3 text-[0.8rem] font-semibold uppercase tracking-widest text-muted-foreground";
const dot = "h-2 w-2 rounded-full bg-primary/60";

export default async function ContactPage({ params, searchParams }: Props) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const sp = await searchParams;

  const [t, common, meta, messages, settings] = await Promise.all([
    getTranslations({ locale: lang, namespace: "Contact" }),
    getTranslations({ locale: lang, namespace: "Common" }),
    getTranslations({ locale: lang, namespace: "Meta" }),
    getMessages(),
    getSiteSettings(),
  ]);
  const brand = brandName(settings, meta("siteName"));
  const socials = visibleSocials(settings);
  const offices = OFFICE_KEYS.filter((key) => addressLine(settings?.offices[key]) !== "");
  const url = `${SITE_URL}/${lang}/contact`;
  const emphasis = { em: (c: React.ReactNode) => <em className="not-italic text-primary">{c}</em> };
  const accent = { accent: (c: React.ReactNode) => <span className="text-primary">{c}</span> };

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: common("home"), url: `${SITE_URL}/${lang}` },
          { name: meta("contact.title"), url },
        ])}
      />
      <JsonLd data={contactJsonLd({ siteUrl: SITE_URL, url, brand, settings })} />

      <section className="border-b border-border bg-gradient-to-br from-background to-muted/30 pb-16 pt-24 md:pb-24 md:pt-32">
        <div className="mx-auto max-w-[1240px] px-4">
          <div className="grid grid-cols-1 items-end gap-10 md:grid-cols-[1.4fr_0.6fr] md:gap-24">
            <div>
              <div className={`${eyebrow} mb-6`}>
                <span className={dot} />
                {t("eyebrow")}
              </div>
              <h1 className="mb-5 text-5xl font-bold leading-[1.1] tracking-[-0.01em] md:text-7xl">
                {t.rich("title", emphasis)}
              </h1>
              <p className="max-w-[53ch] text-lg text-muted-foreground">{t("lead")}</p>
            </div>
            <div className="flex flex-col border-l-2 border-primary/20 py-2 pl-6">
              <span className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground">{t("cityTag")}</span>
              <strong className="mb-4 text-lg leading-snug">{t("tagline")}</strong>
              {settings?.email && (
                <a href={`mailto:${settings.email}`} className="flex items-center gap-1 font-medium text-primary hover:underline">
                  {t("emailCta")}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border py-16 md:py-24">
        <div className="mx-auto max-w-[1240px] px-4">
          <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
            <div>
              <div className={`${eyebrow} mb-6`}>
                <span className={dot} />
                {t("methods.eyebrow")}
              </div>
              <h2 className="mb-6 text-4xl font-bold leading-[1.15] md:text-5xl">{t.rich("methods.title", accent)}</h2>
              <p className="mb-8 max-w-[40ch] text-lg text-muted-foreground">{t("methods.lead")}</p>
              <div className="flex items-center gap-2 border-t border-border pt-6 text-sm font-semibold tracking-widest text-primary">
                {t("methods.start")}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {settings?.phone && (
                <a
                  href={`tel:${phoneToTel(settings.phone)}`}
                  className="group flex items-center justify-between rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
                >
                  <div className="flex flex-col">
                    <span className="mb-1 text-xs font-semibold tracking-widest text-muted-foreground">{t("methods.hotline")}</span>
                    <strong className="text-xl">{settings.phone}</strong>
                  </div>
                  <span aria-hidden className="text-primary opacity-0 transition-opacity group-hover:opacity-100">↗</span>
                </a>
              )}
              {settings?.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="group flex items-center justify-between rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
                >
                  <div className="flex flex-col">
                    <span className="mb-1 text-xs font-semibold tracking-widest text-muted-foreground">{t("methods.email")}</span>
                    <strong className="text-xl">{settings.email}</strong>
                  </div>
                  <span aria-hidden className="text-primary opacity-0 transition-opacity group-hover:opacity-100">↗</span>
                </a>
              )}
              {socials.length > 0 && (
                <div className="flex flex-col rounded-xl border border-border bg-card p-6">
                  <span className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground">{t("methods.social")}</span>
                  <SocialLinks items={socials} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {offices.length > 0 && (
        <section className="border-b border-border bg-muted/20 py-16 md:py-24">
          <div className="mx-auto max-w-[1240px] px-4">
            <div className="mb-12">
              <div className={`${eyebrow} mb-4`}>
                <span className={dot} />
                {t("locations.eyebrow")}
              </div>
              <h2 className="mb-4 text-4xl font-bold leading-[1.15]">{t("locations.title")}</h2>
              <p className="text-lg text-muted-foreground">{t("locations.lead")}</p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {offices.map((key) => (
                <article
                  key={key}
                  className="flex flex-col items-start rounded-2xl border border-border bg-card p-8 transition-colors hover:border-primary/40"
                >
                  <div className="mb-4 text-xs font-semibold tracking-widest text-muted-foreground">{t(`locations.${key}.tag`)}</div>
                  <h3 className="mb-2 text-2xl font-bold leading-[1.2]">{t(`locations.${key}.title`)}</h3>
                  <p className="mb-8 text-muted-foreground">{addressLine(settings?.offices[key])}</p>
                  <a
                    href={mapsUrl(settings?.offices[key])}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-primary"
                  >
                    {t("locations.directions")}
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-[1240px] px-4">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
            <div>
              <div className={`${eyebrow} mb-6`}>
                <span className={dot} />
                {t("form.eyebrow")}
              </div>
              <h2 className="mb-6 text-4xl font-bold leading-[1.15] md:text-5xl">{t.rich("form.title", accent)}</h2>
              <p className="mb-8 max-w-[45ch] text-lg text-muted-foreground">{t("form.lead")}</p>
              <div className="inline-block rounded-lg bg-muted p-4 text-sm font-medium text-foreground">{t("form.note")}</div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
              <div className="mb-6 text-xs font-bold tracking-widest text-primary">{t("form.panelTag")}</div>
              {/* Chỉ gửi xuống client nhóm chữ mà form dùng. */}
              <NextIntlClientProvider
                messages={{
                  Contact: {
                    form: messages.Contact.form,
                    errors: messages.Contact.errors,
                    toast: messages.Contact.toast,
                  },
                }}
              >
                <ContactForm
                  defaultTopic={parseTopicParam(sp.topic)}
                  defaultJob={parseJobParam(sp.job)}
                />
              </NextIntlClientProvider>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
