import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("NotFound");
  return (
    <section className="mx-auto max-w-3xl px-4 py-32 text-center">
      <h1 className="text-5xl font-bold leading-[1.12]">404</h1>
      <p className="mt-4 text-muted-foreground">{t("text")}</p>
      <Link href="/" className="mt-8 inline-block text-primary underline underline-offset-4">
        {t("home")}
      </Link>
    </section>
  );
}
