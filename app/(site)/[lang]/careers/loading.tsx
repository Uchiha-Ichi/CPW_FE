import { getTranslations } from "next-intl/server";

export default async function Loading() {
  const t = await getTranslations("Common");
  return (
    <div role="status" aria-busy="true" className="mx-auto max-w-6xl px-4 pb-20 pt-32">
      <span className="sr-only">{t("loading")}</span>
      <div className="h-10 w-2/3 rounded bg-muted motion-safe:animate-pulse" />
      <div className="mt-6 h-5 w-1/2 rounded bg-muted motion-safe:animate-pulse" />
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="aspect-[4/3] rounded-2xl bg-muted motion-safe:animate-pulse" />
        <div className="aspect-[4/3] rounded-2xl bg-muted motion-safe:animate-pulse" />
      </div>
    </div>
  );
}
