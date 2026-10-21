import styles from "./hero-block.module.css";
import { HeroSlider } from "./hero-slider";
import { HeroCards } from "./hero-cards";
import { RichTitle } from "./shared/rich-title";
import { BlockLink } from "./shared/block-link";
import { list, str } from "@/lib/blocks/read";
import { BLOCK_WRAP } from "@/lib/blocks/rhythm";
import { cn } from "@/lib/utils";
import type { BlockProps } from "./types";

type Button = { label: string; href: string; outline: boolean };
type Proof = { t?: string; d?: string };

interface HeroCopyProps {
  title: string;
  tagline?: string;
  text?: string;
  text2?: string;
  note?: string;
  buttons: Button[];
  proof: Proof[];
  lang: BlockProps["lang"];
  /** Chữ nằm trên ảnh nền tối (hero có slide): đổi sang tông trắng. */
  onDark?: boolean;
  /** Bố cục 2 cột (hero không slide). */
  split?: boolean;
}

function HeroCopy({
  title,
  tagline,
  text,
  text2,
  note,
  buttons,
  proof,
  lang,
  onDark,
  split,
}: HeroCopyProps) {
  return (
    <>
      {tagline && (
        <p
          className={cn(
            split
              ? "mb-[14px] text-[clamp(16px,1.45vw,21px)] font-semibold text-foreground [html[data-theme=light]_&]:text-[var(--vcb-navy)]"
              : "mb-[14px] text-lg font-semibold text-white/90 md:text-xl",
          )}
        >
          {tagline}
        </p>
      )}
      <h1
        className={cn(
          split
            ? "max-w-[12em] text-[clamp(40px,5.2vw,76px)] font-bold leading-[1.12] tracking-normal text-primary [&_em]:text-inherit max-[900px]:max-w-none max-[900px]:text-[clamp(38px,12vw,60px)]"
            : "text-4xl font-bold leading-[1.12] md:text-5xl lg:text-6xl",
        )}
      >
        <RichTitle text={title} />
      </h1>
      {text && (
        <p
          className={cn(
            split
              ? "mt-[22px] max-w-[min(52ch,40vw)] text-[clamp(15px,1.2vw,18px)] leading-[1.65] [text-wrap:pretty] text-[color-mix(in_srgb,var(--foreground)_88%,var(--background))] max-[900px]:max-w-none"
              : cn("mt-6 max-w-[56ch] text-lg leading-relaxed", onDark ? "text-white/85" : "text-muted-foreground"),
          )}
        >
          {text}
        </p>
      )}
      {text2 && (
        <p
          className={cn(
            split
              ? "mt-[14px] max-w-[min(52ch,40vw)] text-[clamp(15px,1.2vw,18px)] leading-[1.65] [text-wrap:pretty] text-[color-mix(in_srgb,var(--foreground)_88%,var(--background))] max-[900px]:max-w-none"
              : cn("mt-[14px] max-w-[56ch] text-lg leading-relaxed", onDark ? "text-white/85" : "text-muted-foreground"),
          )}
        >
          {text2}
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
      {note && (
        <p
          className={cn(
            split
              ? "mt-7 max-w-[min(52ch,40vw)] border-t border-border pt-[14px] text-[15px] font-semibold text-foreground [html[data-theme=light]_&]:text-[var(--vcb-navy)] max-[900px]:max-w-none"
              : "mt-7 border-t border-white/25 pt-[14px] text-[15px] font-semibold text-white/85",
          )}
        >
          {note}
        </p>
      )}
    </>
  );
}

export function HeroBlock({ data, lang }: BlockProps) {
  const title = str(data.title);
  if (!title) return null;

  const tagline = str(data.tagline);
  const text = str(data.text);
  const text2 = str(data.text2);
  const note = str(data.note);

  const slides = list(data.slides)
    .map((s) => str(s.image))
    .filter((src): src is string => Boolean(src));
  const buttons = list(data.buttons)
    .map((b) => ({ label: str(b.label), href: str(b.href), outline: b.style === "outline" }))
    .filter((b): b is Button => Boolean(b.label && b.href));
  const proof = list(data.proof)
    .map((p) => ({ t: str(p.t), d: str(p.d) }))
    .filter((p) => p.t || p.d);

  // Có ảnh nền thì dùng bố cục tràn màn hình (từ 2 ảnh tự xoay). Chưa có ảnh thì hero 2 cột split (thay hẳn nhánh glow cũ).
  if (slides.length > 0) {
    return (
      <HeroSlider slides={slides}>
        <div className={cn(styles.in, "max-w-2xl")}>
          <HeroCopy
            title={title}
            tagline={tagline}
            text={text}
            text2={text2}
            note={note}
            buttons={buttons}
            proof={proof}
            lang={lang}
            onDark
          />
        </div>
      </HeroSlider>
    );
  }

  const cards = list(data.cards)
    .map((c) => str(c.image))
    .filter((src): src is string => Boolean(src));

  return (
    <section className="relative flex min-h-[540px] items-center border-b border-border bg-[color-mix(in_srgb,var(--primary)_7%,var(--background))] py-20 max-[900px]:block max-[900px]:min-h-0 max-[900px]:py-12 max-[900px]:pb-10">
      <div className={BLOCK_WRAP}>
        <div className={cn(styles.in, "max-w-3xl")}>
          <HeroCopy
            title={title}
            tagline={tagline}
            text={text}
            text2={text2}
            note={note}
            buttons={buttons}
            proof={proof}
            lang={lang}
            split
          />
        </div>
        <HeroCards images={cards} />
      </div>
    </section>
  );
}
