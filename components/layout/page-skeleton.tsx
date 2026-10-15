import { getTranslations } from "next-intl/server";
import { PageContainer } from "@/components/layout/page-container";
import { PageSection } from "@/components/layout/page-section";

export async function PageSkeleton() {
  const t = await getTranslations("Common");
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">{t("loading")}</span>
      <section className="border-b border-border">
        <PageContainer className="py-16 md:py-24">
          <div className="h-4 w-24 rounded bg-muted motion-safe:animate-pulse" />
          <div className="mt-6 h-12 w-2/3 rounded bg-muted motion-safe:animate-pulse" />
          <div className="mt-6 h-5 w-1/2 rounded bg-muted motion-safe:animate-pulse" />
        </PageContainer>
      </section>
      <PageSection>
        <div className="grid gap-12 md:grid-cols-2">
          <div className="aspect-[4/3] rounded-3xl bg-muted motion-safe:animate-pulse" />
          <div className="aspect-[4/3] rounded-3xl bg-muted motion-safe:animate-pulse" />
        </div>
      </PageSection>
    </div>
  );
}
