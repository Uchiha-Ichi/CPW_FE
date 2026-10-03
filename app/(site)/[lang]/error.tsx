"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function SiteError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useTranslations("Errors");
  return (
    <section className="mx-auto max-w-3xl px-4 py-32 text-center">
      <h1 className="text-3xl font-bold leading-[1.12] md:text-4xl">{t("title")}</h1>
      <p className="mt-4 text-muted-foreground">{t("text")}</p>
      <div className="mt-8 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-primary hover:text-white"
        >
          {t("retry")}
        </button>
        <Link href="/" className="text-primary underline underline-offset-4">
          {t("home")}
        </Link>
      </div>
    </section>
  );
}
