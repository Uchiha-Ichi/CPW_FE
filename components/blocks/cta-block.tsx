import styles from "./cta-block.module.css";
import { RichTitle } from "./shared/rich-title";
import { Reveal } from "./shared/reveal";
import { BlockLink } from "./shared/block-link";
import { list, str } from "@/lib/blocks/read";
import { BLOCK_LEAD, BLOCK_SECTION, BLOCK_WRAP } from "@/lib/blocks/rhythm";
import { cn } from "@/lib/utils";
import type { BlockProps } from "./types";

type Button = { label: string; href: string; outline: boolean };

export function CtaBlock({ data, lang }: BlockProps) {
  const title = str(data.title);
  if (!title) return null;

  const text = str(data.text);
  const buttons = list(data.buttons)
    .map((b) => ({ label: str(b.label), href: str(b.href), outline: b.style === "outline" }))
    .filter((b): b is Button => Boolean(b.label && b.href));

  return (
    <section className={cn(BLOCK_SECTION, styles.section)}>
      <Reveal className={cn(BLOCK_WRAP, "text-center")}>
        <h2
          className={cn(
            styles.title,
            "mx-auto max-w-[17em] text-[clamp(30px,4.6vw,56px)] font-bold leading-[1.12] tracking-normal text-balance",
          )}
        >
          <RichTitle text={title} />
        </h2>
        {text && <p className={cn(BLOCK_LEAD, styles.lead, "mx-auto")}>{text}</p>}
        {buttons.length > 0 && (
          <div className={styles.buttons}>
            {buttons.map((b) => (
              <BlockLink
                key={`${b.href}-${b.label}`}
                href={b.href}
                lang={lang}
                className={cn(styles.btn, b.outline ? styles.outline : styles.solid)}
              >
                {b.label}
              </BlockLink>
            ))}
          </div>
        )}
      </Reveal>
    </section>
  );
}
