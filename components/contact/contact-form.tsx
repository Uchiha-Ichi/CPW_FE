"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { submitContact, type SubmitContactResult } from "@/app/(site)/[lang]/contact/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CONTACT_TOPICS,
  contactSchema,
  type ContactFormValues,
  type ContactTopic,
} from "@/lib/contact/schema";

const labelClass =
  "mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground";
const selectClass =
  "flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

function emptyValues(topic: ContactTopic, job: string | undefined): ContactFormValues {
  return { name: "", email: "", phone: "", company: "", topic, job: job ?? "", message: "" };
}

export function ContactForm({
  defaultTopic = "business",
  defaultJob,
}: {
  defaultTopic?: ContactTopic;
  defaultJob?: string;
}) {
  const t = useTranslations("Contact");
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: emptyValues(defaultTopic, defaultJob),
  });

  const errorText = (code: string | undefined) =>
    code === "required" || code === "email" || code === "tooLong"
      ? t(`errors.${code}`)
      : undefined;

  function onSubmit(values: ContactFormValues) {
    startTransition(async () => {
      let result: SubmitContactResult;
      try {
        result = await submitContact(values);
      } catch {
        // Không gọi được Server Action (mất mạng giữa trình duyệt và server): coi như gửi thất bại.
        result = { ok: false, reason: "failed" };
      }
      if (result.ok) {
        toast.success(t("toast.success"));
        reset(emptyValues(defaultTopic, defaultJob));
        return;
      }
      // Thất bại: KHÔNG reset, giữ nguyên nội dung đã gõ để người dùng gửi lại.
      toast.error(result.reason === "invalid" ? t("toast.invalid") : t("toast.failed"));
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <Label htmlFor="name" className={labelClass}>{t("form.name")}</Label>
        <Input
          id="name"
          autoComplete="name"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "name-error" : undefined}
          placeholder={t("form.namePlaceholder")}
          className="h-12 border-border bg-background"
          {...register("name")}
        />
        {errors.name && (
          <p id="name-error" className="mt-1 text-sm text-destructive">{errorText(errors.name.message)}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email" className={labelClass}>{t("form.email")}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "email-error" : undefined}
          placeholder={t("form.emailPlaceholder")}
          className="h-12 border-border bg-background"
          {...register("email")}
        />
        {errors.email && (
          <p id="email-error" className="mt-1 text-sm text-destructive">{errorText(errors.email.message)}</p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="phone" className={labelClass}>{t("form.phone")}</Label>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            aria-invalid={errors.phone ? true : undefined}
            className="h-12 border-border bg-background"
            {...register("phone")}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-destructive">{errorText(errors.phone.message)}</p>
          )}
        </div>
        <div>
          <Label htmlFor="company" className={labelClass}>{t("form.company")}</Label>
          <Input
            id="company"
            autoComplete="organization"
            placeholder={t("form.companyPlaceholder")}
            aria-invalid={errors.company ? true : undefined}
            className="h-12 border-border bg-background"
            {...register("company")}
          />
          {errors.company && (
            <p className="mt-1 text-sm text-destructive">{errorText(errors.company.message)}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="topic" className={labelClass}>{t("form.topic")}</Label>
        <select id="topic" className={selectClass} {...register("topic")}>
          {CONTACT_TOPICS.map((topic) => (
            <option key={topic} value={topic}>
              {t(`form.topics.${topic}`)}
            </option>
          ))}
        </select>
      </div>

      {defaultJob && (
        <div>
          <span className={labelClass}>{t("form.job")}</span>
          <p className="rounded-md border border-border bg-muted/30 px-3 py-3 text-sm">{defaultJob}</p>
          <input type="hidden" {...register("job")} />
        </div>
      )}

      <div>
        <Label htmlFor="message" className={labelClass}>{t("form.message")}</Label>
        <Textarea
          id="message"
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "message-error" : undefined}
          placeholder={t("form.messagePlaceholder")}
          className="min-h-[120px] border-border bg-background"
          {...register("message")}
        />
        {errors.message && (
          <p id="message-error" className="mt-1 text-sm text-destructive">{errorText(errors.message.message)}</p>
        )}
      </div>

      <Button type="submit" size="lg" disabled={pending} className="h-12 w-full text-base">
        {pending ? t("form.sending") : t("form.submit")}
      </Button>
    </form>
  );
}
