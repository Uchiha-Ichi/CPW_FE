import { getTranslations } from "next-intl/server";
import { Reveal } from "./shared/reveal";

export async function EmptyPage({ variant = "empty" }: { variant?: "empty" | "error" }) {
  const t = await getTranslations("Empty");
  const isError = variant === "error";
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 text-center">
      <Reveal>
        <h1 className="text-3xl font-bold leading-[1.12] md:text-4xl">
          {isError ? t("errorTitle") : t("title")}
        </h1>
        <p className="mt-4 text-muted-foreground">{isError ? t("errorText") : t("text")}</p>
      </Reveal>
    </section>
  );
}
