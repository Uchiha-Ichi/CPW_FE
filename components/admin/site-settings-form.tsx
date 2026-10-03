"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { cloneElement, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { errorMessages, isSessionExpired } from "@/lib/admin/post-errors";
import { getAdminSiteSettings, saveAdminSiteSettings } from "@/lib/admin/site-settings-api";
import {
  emptyFormValues,
  fromSettings,
  siteSettingsFormSchema,
  type SiteSettingsFormValues,
} from "@/lib/admin/site-settings-form";
import { SOCIAL_KEYS } from "@/lib/site/settings-model";
import { SOCIAL_LABELS } from "@/lib/site/socials";

const OFFICES = [
  { key: "headquarters", title: "Trụ sở chính" },
  { key: "showroom", title: "Không gian trưng bày" },
] as const;

type ControlProps = { "aria-invalid"?: boolean; "aria-describedby"?: string };

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactElement<ControlProps>;
}) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      {cloneElement(children, {
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
      })}
      {hint && !error && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function SiteSettingsForm() {
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: fieldErrors },
  } = useForm<SiteSettingsFormValues>({
    resolver: zodResolver(siteSettingsFormSchema),
    defaultValues: emptyFormValues(),
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const settings = await getAdminSiteSettings();
        if (!cancelled) reset(fromSettings(settings));
      } catch (err) {
        if (cancelled) return;
        setErrors(errorMessages(err));
        setLoadFailed(true);
        if (isSessionExpired(err)) setSessionExpired(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reset, reloadKey]);

  function retryLoad() {
    setErrors([]);
    setSessionExpired(false);
    setLoadFailed(false);
    setLoading(true);
    setReloadKey((k) => k + 1);
  }

  async function onSubmit(values: SiteSettingsFormValues) {
    setSaving(true);
    setSaved(false);
    setErrors([]);
    try {
      const settings = await saveAdminSiteSettings(values);
      reset(fromSettings(settings));
      setSaved(true);
    } catch (err) {
      setErrors(errorMessages(err));
      if (isSessionExpired(err)) setSessionExpired(true);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Đang tải…</p>;

  // Tải thất bại thì không hiện form: lưu form rỗng sẽ ghi đè mất dữ liệu đang có (PATCH thay nguyên bản ghi).
  if (loadFailed) {
    return (
      <div className="space-y-4">
        <ul role="alert" className="list-disc space-y-1 pl-5 text-sm text-destructive">
          {errors.map((message, index) => (
            <li key={`${index}-${message}`}>{message}</li>
          ))}
        </ul>
        {sessionExpired && (
          <p className="text-sm">
            <Link className="underline" href="/admin/login">Đăng nhập lại</Link>
          </p>
        )}
        <Button type="button" onClick={retryLoad}>
          Tải lại
        </Button>
      </div>
    );
  }

  const legend = "text-base font-semibold";

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
      {sessionExpired && (
        <p role="alert" className="rounded-md border border-destructive/40 p-3 text-sm">
          Phiên đăng nhập đã hết hạn. <Link className="underline" href="/admin/login">Đăng nhập lại</Link>
        </p>
      )}

      <fieldset className="space-y-4">
        <legend className={legend}>Công ty</legend>
        <Field id="name" label="Tên công ty" error={fieldErrors.name?.message}>
          <Input id="name" {...register("name")} />
        </Field>
        <Field id="taxId" label="Mã số thuế" error={fieldErrors.taxId?.message}>
          <Input id="taxId" {...register("taxId")} />
        </Field>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className={legend}>Liên hệ</legend>
        <Field
          id="phone"
          label="Số điện thoại"
          hint="Nhập đúng kiểu muốn hiển thị, ví dụ 086.836.6662. Liên kết gọi điện được tự tạo."
          error={fieldErrors.phone?.message}
        >
          <Input id="phone" type="tel" {...register("phone")} />
        </Field>
        <Field id="email" label="Email" error={fieldErrors.email?.message}>
          <Input id="email" type="email" {...register("email")} />
        </Field>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className={legend}>Mạng xã hội</legend>
        <p className="text-sm text-muted-foreground">
          Chỉ điền link (bắt đầu bằng https://). Để trống thì mạng đó không hiện trên web.
        </p>
        {SOCIAL_KEYS.map((key) => (
          <Field key={key} id={`social-${key}`} label={SOCIAL_LABELS[key]} error={fieldErrors.socials?.[key]?.message}>
            <Input
              id={`social-${key}`}
              inputMode="url"
              placeholder="https://"
              {...register(`socials.${key}`)}
            />
          </Field>
        ))}
      </fieldset>

      {OFFICES.map(({ key, title }) => (
        <fieldset key={key} className="space-y-4">
          <legend className={legend}>Địa chỉ: {title}</legend>
          <Field
            id={`${key}-street`}
            label="Số nhà, đường, phường"
            error={fieldErrors.offices?.[key]?.street?.message}
          >
            <Input id={`${key}-street`} {...register(`offices.${key}.street`)} />
          </Field>
          <Field id={`${key}-city`} label="Thành phố" error={fieldErrors.offices?.[key]?.city?.message}>
            <Input id={`${key}-city`} {...register(`offices.${key}.city`)} />
          </Field>
        </fieldset>
      ))}

      {errors.length > 0 && (
        <ul role="alert" className="list-disc space-y-1 pl-5 text-sm text-destructive">
          {errors.map((message, index) => (
            <li key={`${index}-${message}`}>{message}</li>
          ))}
        </ul>
      )}
      {saved && (
        <p role="status" className="text-sm">
          Đã lưu. Trang công khai cập nhật trong vòng 1 phút.
        </p>
      )}

      <Button type="submit" disabled={saving}>
        {saving ? "Đang lưu…" : "Lưu"}
      </Button>
    </form>
  );
}
