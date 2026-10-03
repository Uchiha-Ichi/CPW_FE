import { z } from "zod";
import {
  HTTPS_URL,
  OFFICE_KEYS,
  SOCIAL_KEYS,
  type SiteSettings,
} from "../site/settings-model";
import { SOCIAL_LABELS } from "../site/socials";

// Cùng quy tắc với backend (site-settings.constants.ts): 8 đến 15 chữ số, tối đa 30 ký tự.
const PHONE = /^\+?(?:[\s.\-()]*\d){8,15}[\s.\-()]*$/;

const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_PHONE = 30;
const MAX_URL = 300;
const MAX_ADDRESS = 200;

const text = (label: string, max: number) =>
  z.string().max(max, `${label} tối đa ${max} ký tự`);

// Ô trống (kể cả chỉ có khoảng trắng) là hợp lệ: nghĩa là "không có".
const blankOr = (valid: (trimmed: string) => boolean) => (value: string) =>
  value.trim() === "" || valid(value.trim());

const social = (label: string) =>
  text(`Liên kết ${label}`, MAX_URL).refine(
    blankOr((v) => HTTPS_URL.test(v)),
    `Liên kết ${label} phải bắt đầu bằng https://`,
  );

const office = z.object({
  street: text("Địa chỉ", MAX_ADDRESS),
  city: text("Thành phố", MAX_ADDRESS),
});

export const siteSettingsFormSchema = z.object({
  name: text("Tên công ty", MAX_NAME),
  taxId: text("Mã số thuế", MAX_NAME),
  phone: text("Số điện thoại", MAX_PHONE).refine(
    blankOr((v) => PHONE.test(v)),
    "Số điện thoại không hợp lệ",
  ),
  email: text("Email", MAX_EMAIL).refine(
    blankOr((v) => z.email().safeParse(v).success),
    "Email không hợp lệ",
  ),
  socials: z.object({
    zalo: social(SOCIAL_LABELS.zalo),
    tiktok: social(SOCIAL_LABELS.tiktok),
    facebook: social(SOCIAL_LABELS.facebook),
    youtube: social(SOCIAL_LABELS.youtube),
    instagram: social(SOCIAL_LABELS.instagram),
    threads: social(SOCIAL_LABELS.threads),
  }),
  offices: z.object({ headquarters: office, showroom: office }),
});

export type SiteSettingsFormValues = z.infer<typeof siteSettingsFormSchema>;

const blankOffice = () => ({ street: "", city: "" });

export function emptyFormValues(): SiteSettingsFormValues {
  return {
    name: "",
    taxId: "",
    phone: "",
    email: "",
    socials: { zalo: "", tiktok: "", facebook: "", youtube: "", instagram: "", threads: "" },
    offices: { headquarters: blankOffice(), showroom: blankOffice() },
  };
}

export function fromSettings(settings: SiteSettings | null): SiteSettingsFormValues {
  const form = emptyFormValues();
  if (!settings) return form;
  form.name = settings.name ?? "";
  form.taxId = settings.taxId ?? "";
  form.phone = settings.phone ?? "";
  form.email = settings.email ?? "";
  for (const key of SOCIAL_KEYS) form.socials[key] = settings.socials[key] ?? "";
  for (const key of OFFICE_KEYS) {
    form.offices[key] = {
      street: settings.offices[key]?.street ?? "",
      city: settings.offices[key]?.city ?? "",
    };
  }
  return form;
}

// Cắt khoảng trắng mọi ô; backend đổi ô trống thành "không có".
export function toPayload(values: SiteSettingsFormValues): SiteSettingsFormValues {
  const form = emptyFormValues();
  form.name = values.name.trim();
  form.taxId = values.taxId.trim();
  form.phone = values.phone.trim();
  form.email = values.email.trim();
  for (const key of SOCIAL_KEYS) form.socials[key] = values.socials[key].trim();
  for (const key of OFFICE_KEYS) {
    form.offices[key] = {
      street: values.offices[key].street.trim(),
      city: values.offices[key].city.trim(),
    };
  }
  return form;
}
