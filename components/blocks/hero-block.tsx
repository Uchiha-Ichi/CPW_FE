import styles from "./hero-block.module.css";
import { Eyebrow } from "./shared/eyebrow";
import { RichTitle } from "./shared/rich-title";
import { BlockLink } from "./shared/block-link";
import { CloudinaryImage } from "./shared/cloudinary-image";
import { list, str } from "@/lib/blocks/read";
import { stripAccent } from "@/lib/blocks/accent";
import { cn } from "@/lib/utils";
import type { BlockProps } from "./types";

type Button = { label: string; href: string; outline: boolean };

export function HeroBlock({ data, lang }: BlockProps) {
  const title = str(data.title);
  if (!title) return null;

  const eyebrow = str(data.eyebrow);
  const text = str(data.text);
  const image = str(data.image);
  const buttons = list(data.buttons)
    .map((b) => ({ label: str(b.label), href: str(b.href), outline: b.style === "outline" }))
    .filter((b): b is Button => Boolean(b.label && b.href));
  const proof = list(data.proof)
    .map((p) => ({ t: str(p.t), d: str(p.d) }))
    .filter((p) => p.t || p.d);

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div aria-hidden className={styles.grid} />
      <div aria-hidden className={cn(styles.glow, styles.glowOne)} />
      <div aria-hidden className={cn(styles.glow, styles.glowTwo)} />

      <div
        className={cn(
          "relative mx-auto grid max-w-[1240px] items-center gap-12 px-4 py-24 md:py-32",
          image && "md:grid-cols-[1.1fr_0.9fr]",
        )}
      >
        <div className={cn(styles.in, !image && "max-w-3xl")}>
          {eyebrow && <Eyebrow className="mb-6">{eyebrow}</Eyebrow>}
          <h1 className="text-4xl font-bold leading-[1.12] md:text-5xl lg:text-6xl">
            <RichTitle text={title} />
          </h1>
          {text && (
            <p className="mt-6 max-w-[56ch] text-lg leading-relaxed text-muted-foreground">
              {text}
            </p>
          )}
          {buttons.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-4">
              {buttons.map((b) => (
                <BlockLink
                  key={`${b.href}-${b.label}`}
                  href={b.href}
                  lang={lang}
                  className={cn(
                    "inline-block rounded-full px-8 py-4 font-medium transition-colors",
                    b.outline
                      ? "border border-border text-foreground hover:border-primary hover:text-primary"
                      : "bg-foreground text-background hover:bg-primary hover:text-primary-foreground",
                  )}
                >
                  {b.label}
                </BlockLink>
              ))}
            </div>
          )}
          {proof.length > 0 && (
            <dl className="mt-12 grid max-w-xl grid-cols-1 gap-6 border-t border-border pt-6 sm:grid-cols-3">
              {proof.map((p, i) => (
                <div key={i}>
                  {p.t && <dt className="text-sm font-bold tracking-widest">{p.t}</dt>}
                  {p.d && <dd className="mt-1 text-sm text-muted-foreground">{p.d}</dd>}
                </div>
              ))}
            </dl>
          )}
        </div>

        {image && (
          <div
            className={cn(
              styles.in,
              "relative aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-card",
            )}
            style={{ animationDelay: "0.12s" }}
          >
            <CloudinaryImage
              src={image}
              alt={stripAccent(title)}
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              preload
              fetchPriority="high"
              className="object-cover"
            />
          </div>
        )}
      </div>
    </section>
  );
}
