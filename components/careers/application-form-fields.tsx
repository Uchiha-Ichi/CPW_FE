"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRef, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { X } from "lucide-react";
import { cn } from "cn";
import { createApplication } from "@/lib/api/applications";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  applicationSchema,
  POSITION_OTHER,
  type ApplicationFormValues,
} from "@/lib/applications/schema";

const labelClass = "mb-1.5 block text-sm text-muted-foreground";
const fieldClass = "h-12 border-border bg-background";
const selectClass =
  "flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const errorTextClass = "mt-1 text-sm text-destructive";
const CV_ACCEPT =
  ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Nhận file qua chọn tay, kéo-thả, hoặc dán (Ctrl+V) từ clipboard; hiện tên file đã chọn kèm nút xoá.
function CvDropzone({
  value,
  onChange,
  onBlur,
  name,
  invalid,
  placeholder,
  removeLabel,
}: {
  value: File | undefined;
  onChange: (file: File | undefined) => void;
  onBlur: () => void;
  name: string;
  invalid: boolean;
  placeholder: string;
  removeLabel: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function clear() {
    onChange(undefined);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        const file = event.dataTransfer.files?.[0];
        if (file) onChange(file);
      }}
      onPaste={(event) => {
        const file = event.clipboardData.files?.[0];
        if (file) {
          event.preventDefault();
          onChange(file);
        }
      }}
      onBlur={onBlur}
      className={cn(
        "flex h-12 cursor-pointer items-center rounded-md border border-dashed bg-muted/20 px-3 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isDragging ? "border-primary bg-primary/5" : invalid ? "border-destructive" : "border-border",
      )}
    >
      <input
        ref={inputRef}
        name={name}
        type="file"
        accept={CV_ACCEPT}
        aria-invalid={invalid ? true : undefined}
        className="hidden"
        onChange={(event) => onChange(event.target.files?.[0])}
      />
      {value ? (
        <div className="flex w-full items-center justify-between gap-3">
          <span className="truncate">
            {value.name} <span className="text-muted-foreground">({formatFileSize(value.size)})</span>
          </span>
          <button
            type="button"
            aria-label={removeLabel}
            onClick={(event) => {
              event.stopPropagation();
              clear();
            }}
            className="shrink-0 rounded-sm p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <span className="text-muted-foreground">{placeholder}</span>
      )}
    </div>
  );
}

const emptyValues: Partial<ApplicationFormValues> = {
  name: "",
  email: "",
  phone: "",
  position: "",
  portfolio: "",
  note: "",
  consent: false,
};

export function ApplicationFormFields({ jobTitles }: { jobTitles: string[] }) {
  const t = useTranslations("Careers.application");
  const [pending, startTransition] = useTransition();
  // Input file không thể "reset" bằng cách gán value: tăng key để buộc remount sau khi gửi thành công.
  const [cvInputKey, setCvInputKey] = useState(0);
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: emptyValues,
  });

  const errorText = (code: string | undefined) =>
    code === "required" ||
    code === "email" ||
    code === "tooLong" ||
    code === "url" ||
    code === "fileRequired" ||
    code === "fileType" ||
    code === "fileTooLarge" ||
    code === "consent"
      ? t(`errors.${code}`)
      : undefined;

  function onSubmit(values: ApplicationFormValues) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      if (values.phone) formData.append("phone", values.phone);
      formData.append("position", values.position);
      if (values.portfolio) formData.append("portfolio", values.portfolio);
      if (values.note) formData.append("note", values.note);
      formData.append("consent", String(values.consent));
      formData.append("cv", values.cv);

      const result = await createApplication(formData);
      if (result.ok) {
        toast.success(t("toast.success"));
        reset(emptyValues);
        setCvInputKey((key) => key + 1);
        return;
      }
      // Thất bại: KHÔNG reset, giữ nguyên nội dung đã nhập để người dùng gửi lại.
      toast.error(result.reason === "invalid" ? t("toast.invalid") : t("toast.failed"));
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <Label htmlFor="career-name" className={labelClass}>{t("name")}</Label>
        <Input
          id="career-name"
          autoComplete="name"
          aria-invalid={errors.name ? true : undefined}
          placeholder={t("namePlaceholder")}
          className={fieldClass}
          {...register("name")}
        />
        {errors.name && <p className={errorTextClass}>{errorText(errors.name.message)}</p>}
      </div>

      <div>
        <Label htmlFor="career-email" className={labelClass}>{t("email")}</Label>
        <Input
          id="career-email"
          type="email"
          autoComplete="email"
          aria-invalid={errors.email ? true : undefined}
          placeholder={t("emailPlaceholder")}
          className={fieldClass}
          {...register("email")}
        />
        {errors.email && <p className={errorTextClass}>{errorText(errors.email.message)}</p>}
      </div>

      <div>
        <Label htmlFor="career-phone" className={labelClass}>{t("phone")}</Label>
        <Input
          id="career-phone"
          type="tel"
          autoComplete="tel"
          aria-invalid={errors.phone ? true : undefined}
          placeholder={t("phonePlaceholder")}
          className={fieldClass}
          {...register("phone")}
        />
        {errors.phone && <p className={errorTextClass}>{errorText(errors.phone.message)}</p>}
      </div>

      <div>
        <Label htmlFor="career-position" className={labelClass}>{t("position")}</Label>
        <select
          id="career-position"
          aria-invalid={errors.position ? true : undefined}
          className={selectClass}
          defaultValue=""
          {...register("position")}
        >
          <option value="" disabled>{t("positionPlaceholder")}</option>
          {jobTitles.map((title) => (
            <option key={title} value={title}>{title}</option>
          ))}
          <option value={POSITION_OTHER}>{POSITION_OTHER}</option>
        </select>
        {errors.position && <p className={errorTextClass}>{errorText(errors.position.message)}</p>}
      </div>

      <div>
        <Label htmlFor="career-portfolio" className={labelClass}>{t("portfolio")}</Label>
        <Input
          id="career-portfolio"
          type="url"
          placeholder="https://"
          aria-invalid={errors.portfolio ? true : undefined}
          className={fieldClass}
          {...register("portfolio")}
        />
        {errors.portfolio && <p className={errorTextClass}>{errorText(errors.portfolio.message)}</p>}
      </div>

      <div>
        <Label htmlFor="career-cv" className={labelClass}>{t("cv")}</Label>
        <Controller
          control={control}
          name="cv"
          render={({ field: { value, onChange, onBlur, name } }) => (
            <CvDropzone
              key={cvInputKey}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              name={name}
              invalid={!!errors.cv}
              placeholder={t("cvDropzone")}
              removeLabel={t("cvRemove")}
            />
          )}
        />
        {errors.cv && <p className={errorTextClass}>{errorText(errors.cv.message)}</p>}
      </div>

      <div>
        <Label htmlFor="career-note" className={labelClass}>{t("note")}</Label>
        <Textarea
          id="career-note"
          placeholder={t("notePlaceholder")}
          aria-invalid={errors.note ? true : undefined}
          className="min-h-[120px] border-border bg-background"
          {...register("note")}
        />
        {errors.note && <p className={errorTextClass}>{errorText(errors.note.message)}</p>}
      </div>

      <div>
        <Controller
          control={control}
          name="consent"
          render={({ field: { value, onChange, name } }) => (
            <label htmlFor="career-consent" className="flex items-start gap-3 text-sm text-muted-foreground">
              <Checkbox
                id="career-consent"
                name={name}
                checked={value ?? false}
                onCheckedChange={onChange}
                aria-invalid={errors.consent ? true : undefined}
                className="mt-0.5"
              />
              <span>{t("consent")}</span>
            </label>
          )}
        />
        {errors.consent && <p className={errorTextClass}>{errorText(errors.consent.message)}</p>}
      </div>

      <Button type="submit" size="lg" disabled={pending} className="h-12 w-full text-base">
        {pending ? t("sending") : t("submit")}
      </Button>
    </form>
  );
}
