import styles from "@/components/blocks/hero-block.module.css";
import { Eyebrow } from "@/components/blocks/shared/eyebrow";
import { PageContainer } from "@/components/layout/page-container";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  lead?: React.ReactNode;
  // Phía trên eyebrow (nút quay lại ở trang chi tiết).
  before?: React.ReactNode;
  // Cột phải từ md trở lên.
  aside?: React.ReactNode;
  // Trang chi tiết: khối chữ tối đa max-w-3xl, neo trái.
  narrow?: boolean;
  // Dưới lead (hàng chip).
  children?: React.ReactNode;
};

export function PageHero({ eyebrow, title, lead, before, aside, narrow, children }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div aria-hidden className={styles.ambient} />
      <div aria-hidden className={cn(styles.glow, styles.glowOne)} />
      <div aria-hidden className={cn(styles.glow, styles.glowTwo)} />

      <PageContainer
        className={cn(
          "relative py-16 md:py-24",
          aside && "grid items-center gap-12 md:grid-cols-[1.1fr_0.9fr]",
        )}
      >
        <div className={cn(styles.in, narrow && "max-w-3xl")}>
          {before}
          {eyebrow && <Eyebrow className="mb-6">{eyebrow}</Eyebrow>}
          <h1 className="break-words text-4xl font-bold leading-[1.12] md:text-5xl lg:text-6xl">
            {title}
          </h1>
          {lead && (
            <p className="mt-6 max-w-[56ch] text-lg leading-relaxed text-muted-foreground">
              {lead}
            </p>
          )}
          {children && <div className="mt-8">{children}</div>}
        </div>

        {aside && (
          <div className={styles.in} style={{ animationDelay: "0.12s" }}>
            {aside}
          </div>
        )}
      </PageContainer>
    </section>
  );
}
