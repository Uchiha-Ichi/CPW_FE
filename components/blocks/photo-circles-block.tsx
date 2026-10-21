import { Quote } from "lucide-react";
import { BlockHead } from "./shared/block-head";
import { Reveal } from "./shared/reveal";
import { CloudinaryMedia } from "./shared/cloudinary-media";
import { ImageSlot } from "./shared/image-slot";
import { list, str } from "@/lib/blocks/read";
import { BLOCK_SECTION, BLOCK_WRAP } from "@/lib/blocks/rhythm";
import { cn } from "@/lib/utils";
import type { BlockProps } from "./types";

// Mỗi vòng tròn chồng lên vòng kế bên bằng chừng này đường kính (mockup CSS 165–171).
// Khớp với -ml-[calc(var(--d)*0.12)] ở dưới.
const OVERLAP = 0.12;

export function PhotoCirclesBlock({ data }: BlockProps) {
  const title = str(data.title);
  if (!title) return null;

  const quote = str(data.quote);
  const circles = list(data.items)
    .slice(0, 4)
    .map((item) => ({ image: str(item.image), label: str(item.label) }))
    .filter((c) => c.image || c.label);
  const n = circles.length;

  // Đường kính: chia vừa bề ngang khung, tối đa 340px, co theo màn hình nhỏ để không tràn.
  const diameter = `min(31vw, 340px, calc(min(100vw - 2rem, 1208px) / ${n - (n - 1) * OVERLAP}))`;

  return (
    <section className={BLOCK_SECTION}>
      <div className={BLOCK_WRAP}>
        <Reveal>
          <BlockHead title={title} />
        </Reveal>
        {quote && (
          <Reveal className="mt-8">
            <blockquote className="max-w-3xl rounded-2xl border-2 border-primary/40 bg-card p-6 md:p-8">
              <Quote aria-hidden className="mb-3 size-7 text-primary" />
              <p className="text-lg leading-relaxed">{quote}</p>
            </blockquote>
          </Reveal>
        )}
        {n > 0 && (
          <ul
            style={{ "--d": diameter } as React.CSSProperties}
            className="mt-[34px] flex flex-row items-center justify-center px-2 pb-2"
          >
            {circles.map((circle, i) => (
              <li
                key={i}
                // Vòng đứng trước nằm trên vòng đứng sau, để nhãn ở nửa dưới của mỗi vòng không bị vòng kế bên che.
                style={{ zIndex: n - i }}
                className={cn(
                  "relative w-[var(--d)] shrink-0",
                  i > 0 && "-ml-[calc(var(--d)*0.12)]",
                )}
              >
                <Reveal delay={i * 80}>
                  <figure className="relative aspect-square overflow-hidden rounded-full border-4 border-background bg-card shadow-[0_12px_32px_rgba(7,20,38,0.10)]">
                    {circle.image ? (
                      <CloudinaryMedia
                        src={circle.image}
                        alt={circle.label ?? ""}
                        sizes="340px"
                        variant="loop"
                        className="object-cover"
                      />
                    ) : (
                      <ImageSlot
                        slot="photo-circles.items.image"
                        label={circle.label}
                        dense
                        className="h-full min-h-0! rounded-full border-0 px-[16%]"
                      />
                    )}
                    {circle.label && (
                      <>
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-x-0 bottom-0 top-[40%] bg-gradient-to-b from-transparent to-black/55"
                        />
                        <figcaption className="absolute inset-x-0 bottom-[14%] px-[12%] text-center text-[clamp(11px,1.5vw,17px)] font-bold leading-snug text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.6)]">
                          {circle.label}
                        </figcaption>
                      </>
                    )}
                  </figure>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
