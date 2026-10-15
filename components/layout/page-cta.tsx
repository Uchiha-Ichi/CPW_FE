import { Reveal } from "@/components/blocks/shared/reveal";
import { PageContainer } from "@/components/layout/page-container";
import { Link } from "@/i18n/navigation";

export function PageCta({
  title,
  href,
  label,
}: {
  title: React.ReactNode;
  href: string;
  label: string;
}) {
  return (
    <section className="bg-muted/20 py-16 text-center md:py-24">
      <PageContainer>
        <Reveal className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold leading-[1.12] md:text-5xl">{title}</h2>
          <Link
            href={href}
            className="mt-10 inline-block rounded-full bg-foreground px-10 py-5 text-lg font-semibold text-background shadow-lg transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            {label} <span aria-hidden>↗</span>
          </Link>
        </Reveal>
      </PageContainer>
    </section>
  );
}
