import { Eyebrow } from "./shared/eyebrow";
import { RichTitle } from "./shared/rich-title";
import { Reveal } from "./shared/reveal";
import { BlockLink } from "./shared/block-link";
import { CloudinaryImage } from "./shared/cloudinary-image";
import { ImagePlaceholder } from "@/components/shared/image-placeholder";
import { str } from "@/lib/blocks/read";
import { stripAccent } from "@/lib/blocks/accent";
import { cn } from "@/lib/utils";
import type { BlockProps } from "./types";

export function TextImageBlock({ data, lang }: BlockProps) {
  const title = str(data.title);
  if (!title) return null;

  const eyebrow = str(data.eyebrow);
  const text = str(data.text);
  const image = str(data.image);
  const imageRight = data.side === "right";
  const linkLabel = str(data.linkLabel);
  const linkHref = str(data.linkHref);
  const plainTitle = stripAccent(title);

  return (
    <section className="border-b border-border py-20 md:py-28">
      <div className="mx-auto grid max-w-[1240px] gap-12 px-4 md:grid-cols-2 md:items-center">
        <Reveal className={cn(imageRight && "md:order-2")}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-card">
            {image ? (
              <CloudinaryImage
                src={image}
                alt={plainTitle}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            ) : (
              <ImagePlaceholder label={plainTitle} className="h-full rounded-3xl border-0" />
            )}
          </div>
        </Reveal>
        <Reveal delay={120}>
          {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
          <h2 className="text-3xl font-bold leading-[1.12] md:text-4xl lg:text-5xl">
            <RichTitle text={title} />
          </h2>
          {text && (
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{text}</p>
          )}
          {linkLabel && linkHref && (
            <BlockLink
              href={linkHref}
              lang={lang}
              className="mt-8 inline-flex items-center gap-2 font-medium text-primary hover:underline"
            >
              {linkLabel} <span aria-hidden>↗</span>
            </BlockLink>
          )}
        </Reveal>
      </div>
    </section>
  );
}
