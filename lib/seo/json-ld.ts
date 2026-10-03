import type {
  Article,
  BreadcrumbList,
  ContactPage,
  JobPosting,
  LocalBusiness,
  Organization,
  WebSite,
  WithContext,
} from "schema-dts";
import type { PublicJob } from "../api/jobs";
import type { Locale } from "../i18n/config";
import { employmentTypeOf } from "../jobs/constants";
import { LOGO_URL } from "../site/business";
import { phoneToTel } from "../site/contact-info";
import { OFFICE_KEYS, type Office, type OfficeKey, type SiteSettings } from "../site/settings-model";
import { visibleSocials } from "../site/socials";

const CONTEXT = "https://schema.org" as const;

// Chuỗi JSON an toàn để đặt trong <script type="application/ld+json">.
// Escape "<" (chặn "</script>") và U+2028/2029 (JSON hợp lệ nhưng làm vỡ JS cũ).
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function organizationId(siteUrl: string): string {
  return `${siteUrl}/#organization`;
}

// Địa chỉ chỉ có khi cơ sở có street; thiếu city thì bỏ addressLocality.
function postalAddress(office: Office | undefined) {
  if (!office?.street) return null;
  return {
    "@type": "PostalAddress" as const,
    streetAddress: office.street,
    ...(office.city ? { addressLocality: office.city } : {}),
    addressCountry: "VN",
  };
}

export function organizationJsonLd(
  siteUrl: string,
  brand: string,
  settings: SiteSettings | null,
): WithContext<Organization> {
  const sameAs = visibleSocials(settings).map((social) => social.url);
  const address = postalAddress(settings?.offices.headquarters);
  return {
    "@context": CONTEXT,
    "@type": "Organization",
    "@id": organizationId(siteUrl),
    name: brand,
    url: siteUrl,
    logo: `${siteUrl}${LOGO_URL}`,
    ...(settings?.phone ? { telephone: phoneToTel(settings.phone) } : {}),
    ...(settings?.email ? { email: settings.email } : {}),
    ...(settings?.taxId ? { taxID: settings.taxId } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
    ...(address ? { address } : {}),
  };
}

export function webSiteJsonLd(siteUrl: string, brand: string): WithContext<WebSite> {
  return {
    "@context": CONTEXT,
    "@type": "WebSite",
    name: brand,
    url: siteUrl,
    inLanguage: ["vi", "en"],
    publisher: { "@id": organizationId(siteUrl) },
  };
}

export function breadcrumbJsonLd(
  items: { name: string; url: string }[],
): WithContext<BreadcrumbList> {
  return {
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function articleJsonLd(input: {
  siteUrl: string;
  url: string;
  lang: Locale;
  headline: string;
  brand: string;
  description?: string;
  image?: string;
  datePublished?: string;
}): WithContext<Article> {
  const organization = {
    "@type": "Organization" as const,
    name: input.brand,
    url: input.siteUrl,
  };
  return {
    "@context": CONTEXT,
    "@type": "Article",
    mainEntityOfPage: input.url,
    headline: input.headline,
    inLanguage: input.lang,
    ...(input.description ? { description: input.description } : {}),
    ...(input.image ? { image: [input.image] } : {}),
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
    author: organization,
    publisher: {
      ...organization,
      logo: { "@type": "ImageObject", url: `${input.siteUrl}${LOGO_URL}` },
    },
  };
}

export function jobPostingJsonLd(input: {
  siteUrl: string;
  url: string;
  brand: string;
  job: PublicJob;
}): WithContext<JobPosting> | null {
  const { job } = input;
  const description = job.description?.trim();
  if (!description) return null;
  const employmentType = employmentTypeOf(job.type);
  return {
    "@context": CONTEXT,
    "@type": "JobPosting",
    title: job.title,
    description,
    url: input.url,
    ...(job.createdAt ? { datePosted: job.createdAt } : {}),
    ...(employmentType ? { employmentType } : {}),
    hiringOrganization: {
      "@type": "Organization",
      name: input.brand,
      sameAs: input.siteUrl,
      logo: `${input.siteUrl}${LOGO_URL}`,
    },
    ...(job.location === "Hà Nội"
      ? {
          jobLocation: {
            "@type": "Place" as const,
            address: {
              "@type": "PostalAddress" as const,
              addressLocality: "Hà Nội",
              addressCountry: "VN",
            },
          },
        }
      : {}),
    ...(job.location === "Remote / Quốc tế" ? { jobLocationType: "TELECOMMUTE" } : {}),
  };
}

const OFFICE_NAMES: Record<OfficeKey, string> = {
  headquarters: "Trụ sở chính",
  showroom: "Không gian trưng bày",
};

export function contactJsonLd(input: {
  siteUrl: string;
  url: string;
  brand: string;
  settings: SiteSettings | null;
}): (WithContext<ContactPage> | WithContext<LocalBusiness>)[] {
  const { settings, brand } = input;
  const office = (key: OfficeKey): WithContext<LocalBusiness> | null => {
    const address = postalAddress(settings?.offices[key]);
    if (!address) return null;
    return {
      "@context": CONTEXT,
      "@type": "LocalBusiness",
      name: `${brand} - ${OFFICE_NAMES[key]}`,
      url: input.url,
      ...(settings?.phone ? { telephone: phoneToTel(settings.phone) } : {}),
      ...(settings?.email ? { email: settings.email } : {}),
      address,
      parentOrganization: { "@id": organizationId(input.siteUrl) },
    };
  };
  const businesses = OFFICE_KEYS.map(office).filter(
    (node): node is WithContext<LocalBusiness> => node !== null,
  );
  return [
    {
      "@context": CONTEXT,
      "@type": "ContactPage",
      name: brand,
      url: input.url,
      mainEntity: { "@id": organizationId(input.siteUrl) },
    },
    ...businesses,
  ];
}
