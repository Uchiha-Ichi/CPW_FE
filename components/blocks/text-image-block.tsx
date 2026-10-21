import { RichTitle } from "./shared/rich-title";
import { Reveal } from "./shared/reveal";
import { BlockLink } from "./shared/block-link";
import { ImageSlot } from "./shared/image-slot";
import { Slideshow } from "./shared/slideshow";
import { list, str } from "@/lib/blocks/read";
import { stripAccent } from "@/lib/blocks/accent";
import { BLOCK_SECTION, BLOCK_WRAP } from "@/lib/blocks/rhythm";
import { cn } from "@/lib/utils";
import type { BlockProps } from "./types";

export function TextImageBlock({ data, lang }: BlockProps) {
  const title = str(data.title);
  if (!title) return null;

  const text = str(data.text);
  const text2 = str(data.text2);
  const slides = list(data.slides)
    .map((s) => str(s.image))
    .filter((src): src is string => !!src);
  const imageRight = data.side === "right";
  const linkLabel = str(data.linkLabel);
  const linkHref = str(data.linkHref);
  const plainTitle = stripAccent(title);

  return (
    <section className={BLOCK_SECTION}>
      <div
        className={cn(
          BLOCK_WRAP,
          "grid grid-cols-1 items-center gap-[clamp(28px,6vw,72px)] min-[861px]:grid-cols-2",
        )}
      >
        {/* DOM ảnh trước chữ: điện thoại ảnh trên, chữ dưới (D5). */}
        <Reveal className={cn(imageRight && "min-[861px]:order-2")}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] border border-border bg-card">
            {slides.length > 0 ? (
              <Slideshow
                images={slides}
                alt={plainTitle}
                sizes="(min-width: 861px) 50vw, 100vw"
                className="h-full w-full"
              />
            ) : (
              <ImageSlot slot="text-image.slides.image" label={plainTitle} className="h-full border-0" />
            )}
          </div>
        </Reveal>
        <Reveal delay={120}>
          <h2 className="text-[clamp(30px,3.8vw,48px)] font-bold leading-[1.12] tracking-normal text-balance">
            <RichTitle text={title} />
          </h2>
          {text && <p className="mt-[22px] text-lg leading-[1.6] text-muted-foreground">{text}</p>}
          {text2 && <p className="mt-3.5 text-lg leading-[1.6] text-muted-foreground">{text2}</p>}
          {linkLabel && linkHref && (
            <BlockLink
              href={linkHref}
              lang={lang}
              className="mt-7 inline-flex items-center gap-2 font-medium text-primary hover:underline"
            >
              {linkLabel} <span aria-hidden>↗</span>
            </BlockLink>
          )}
        </Reveal>
      </div>
    </section>
  );
}
