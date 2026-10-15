import { Quote } from "lucide-react";
import { SectionHead } from "./shared/section-head";
import { Reveal } from "./shared/reveal";
import { CloudinaryMedia } from "./shared/cloudinary-media";
import { ImageSlot } from "./shared/image-slot";
import { list, str } from "@/lib/blocks/read";
import { cn } from "@/lib/utils";
import type { BlockProps } from "./types";

// Mỗi vòng tròn chồng lên vòng kế bên bằng chừng này đường kính. Khớp với -ml-[calc(var(--d)*0.18)] ở dưới
// (class viết nguyên chữ để Tailwind quét được).
const OVERLAP = 0.18;

export function PhotoCirclesBlock({ data }: BlockProps) {
  const title = str(data.title);
  if (!title) return null;

  const quote = str(data.quote);
  const circles = list(data.items)
    .slice(0, 4)
    .map((item) => ({ image: str(item.image), label: str(item.label) }))
    .filter((c) => c.image || c.label);
  const n = circles.length;
  // Đường kính từ md trở lên: chia vừa bề ngang khung (tối đa 1208px), không quá 380px. Dưới md các vòng xếp dọc, rộng 280px.
  const diameter = `min(380px, calc(min(100vw - 2rem, 1208px) / ${n - (n - 1) * OVERLAP}))`;

  return (
    <section className="border-b border-border py-12 md:py-16">
      <div className="mx-auto max-w-[1240px] px-4">
        <Reveal>
          <SectionHead title={title} flush />
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
            className="mt-10 flex flex-col items-center pb-2 md:mt-12 md:flex-row md:justify-center"
          >
            {circles.map((circle, i) => (
              <li
                key={i}
                // Vòng đứng trước nằm trên vòng đứng sau, để nhãn ở nửa dưới của mỗi vòng không bị vòng kế bên che.
                style={{ zIndex: n - i }}
                className={cn(
                  "relative w-[min(280px,100%)] max-[519px]:w-[min(232px,100%)] md:w-[var(--d)]",
                  i > 0 && "-mt-12 max-[519px]:-mt-10 md:mt-0 md:-ml-[calc(var(--d)*0.18)]",
                )}
              >
                <Reveal delay={i * 80}>
                  <figure className="relative aspect-square overflow-hidden rounded-full border-4 border-background bg-card shadow-[0_24px_50px_-28px_rgba(7,20,38,0.7)]">
                    {circle.image ? (
                      <CloudinaryMedia
                        src={circle.image}
                        alt={circle.label ?? ""}
                        sizes="(min-width: 768px) 380px, 280px"
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
                    {circle.image && circle.label && (
                      <>
                        <span
                          aria-hidden
                          className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent"
                        />
                        <figcaption className="absolute inset-x-0 bottom-[15%] px-[14%] text-center text-sm font-bold uppercase leading-snug tracking-[0.16em] text-white">
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
