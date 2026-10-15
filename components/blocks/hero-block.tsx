import styles from "./hero-block.module.css";
import { HeroSlider } from "./hero-slider";
import { RichTitle } from "./shared/rich-title";
import { BlockLink } from "./shared/block-link";
import { list, str } from "@/lib/blocks/read";
import { cn } from "@/lib/utils";
import type { BlockProps } from "./types";

type Button = { label: string; href: string; outline: boolean };
type Proof = { t?: string; d?: string };

interface HeroCopyProps {
  title: string;
  text?: string;
  buttons: Button[];
  proof: Proof[];
  lang: BlockProps["lang"];
  /** Chữ nằm trên ảnh nền tối (hero có slide): đổi sang tông trắng. */
  onDark?: boolean;
}

function HeroCopy({ title, text, buttons, proof, lang, onDark }: HeroCopyProps) {
  return (
    <>
      <h1 className="text-4xl font-bold leading-[1.12] md:text-5xl lg:text-6xl">
        <RichTitle text={title} />
      </h1>
      {text && (
        <p
          className={cn(
            "mt-6 max-w-[56ch] text-lg leading-relaxed",
            onDark ? "text-white/85" : "text-muted-foreground",
          )}
        >
          {text}
        </p>
      )}
      {buttons.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-4 max-[519px]:flex-col max-[519px]:gap-3 max-[519px]:text-center">
          {buttons.map((b) => (
            <BlockLink
              key={`${b.href}-${b.label}`}
              href={b.href}
              lang={lang}
              className={cn(
                "inline-block rounded-full px-8 py-4 font-medium transition-colors",
                b.outline
                  ? onDark
                    ? "border border-white/50 text-white hover:border-white hover:bg-white/10"
                    : "border border-border text-foreground hover:border-primary hover:text-primary"
                  : onDark
                    ? "bg-white text-black hover:bg-primary hover:text-primary-foreground"
                    : "bg-foreground text-background hover:bg-primary hover:text-primary-foreground",
              )}
            >
              {b.label}
            </BlockLink>
          ))}
        </div>
      )}
      {proof.length > 0 && (
        <dl
          className={cn(
            "mt-12 grid max-w-xl grid-cols-1 gap-6 border-t pt-6 sm:grid-cols-3",
            onDark ? "border-white/25" : "border-border",
          )}
        >
          {proof.map((p, i) => (
            <div key={i}>
              {p.t && <dt className="text-sm font-bold tracking-widest">{p.t}</dt>}
              {p.d && (
                <dd className={cn("mt-1 text-sm", onDark ? "text-white/75" : "text-muted-foreground")}>
                  {p.d}
                </dd>
              )}
            </div>
          ))}
        </dl>
      )}
    </>
  );
}

export function HeroBlock({ data, lang }: BlockProps) {
  const title = str(data.title);
  if (!title) return null;

  const text = str(data.text);
  const slides = list(data.slides)
    .map((s) => str(s.image))
    .filter((src): src is string => Boolean(src));
  const buttons = list(data.buttons)
    .map((b) => ({ label: str(b.label), href: str(b.href), outline: b.style === "outline" }))
    .filter((b): b is Button => Boolean(b.label && b.href));
  const proof = list(data.proof)
    .map((p) => ({ t: str(p.t), d: str(p.d) }))
    .filter((p) => p.t || p.d);

  // Có ảnh nền thì dùng bố cục tràn màn hình (từ 2 ảnh tự xoay). Chưa có ảnh thì hero chỉ có chữ trên nền glow mờ.
  if (slides.length > 0) {
    return (
      <HeroSlider slides={slides}>
        <div className={cn(styles.in, "max-w-2xl")}>
          <HeroCopy
            title={title}
            text={text}
            buttons={buttons}
            proof={proof}
            lang={lang}
            onDark
          />
        </div>
      </HeroSlider>
    );
  }

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div aria-hidden className={styles.ambient} />
      <div aria-hidden className={cn(styles.glow, styles.glowOne)} />
      <div aria-hidden className={cn(styles.glow, styles.glowTwo)} />

      <div className="relative mx-auto max-w-[1240px] px-4 py-16 md:py-24">
        <div className={cn(styles.in, "max-w-3xl")}>
          <HeroCopy
            title={title}
            text={text}
            buttons={buttons}
            proof={proof}
            lang={lang}
          />
        </div>
      </div>
    </section>
  );
}
