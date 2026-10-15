import { Quote } from "lucide-react";
import { SectionHead } from "./shared/section-head";
import { Reveal } from "./shared/reveal";
import { CloudinaryMedia } from "./shared/cloudinary-media";
import { ImageSlot } from "./shared/image-slot";
import { list, str } from "@/lib/blocks/read";
import { cn } from "@/lib/utils";
import type { BlockProps } from "./types";

type Column = { images: string[]; label?: string };

// Số cột trên mỗi hàng theo số cột của khối. Class viết nguyên chữ để Tailwind quét được.
// Điện thoại (< 520px) xếp 2 cột (trừ khối 1 cột) để khối không dài gấp 3–4 lần màn hình.
const GRID: Record<number, string> = {
  1: "max-w-sm",
  2: "max-[519px]:grid-cols-2 sm:grid-cols-2",
  3: "max-[519px]:grid-cols-2 md:grid-cols-3",
  4: "max-[519px]:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4",
};

// Khối 3 cột: trên điện thoại cột thứ ba nằm lẻ một mình ở hàng cuối, cho ra giữa và rộng bằng một cột.
const LAST_ODD: Record<number, string> = {
  3: "max-[519px]:last:col-span-2 max-[519px]:last:mx-auto max-[519px]:last:w-[calc(50%-0.375rem)]",
};

// Dải xanh đậm chỉ bắt đầu ở nửa dưới thẻ khi các cột đã nằm trên một hàng; khi cột xếp chồng thì phủ cả vùng.
const BAND_TOP: Record<number, string> = {
  1: "top-[38%]",
  2: "top-0 sm:top-[38%]",
  3: "top-0 md:top-[38%]",
  4: "top-0 lg:top-[38%]",
};

export function PhotoColumnsBlock({ data }: BlockProps) {
  const title = str(data.title);
  if (!title) return null;

  const quote = str(data.quote);
  const columns: Column[] = list(data.items)
    .slice(0, 4)
    .map((item) => ({
      images: [str(item.image), str(item.image2)].filter((src): src is string => Boolean(src)),
      label: str(item.label),
    }))
    .filter((c) => c.images.length > 0 || c.label);
  const n = columns.length;

  return (
    <section className="border-b border-border pt-12 md:pt-16">
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
      </div>

      {n > 0 && (
        <div className="relative mt-8 md:mt-10">
          {/* Dải luôn tối như khối Tuyên ngôn: nền xanh đậm pha từ token --tech-*, không dùng --background vì nó đảo màu theo giao diện. */}
          <div
            aria-hidden
            className={cn(
              "absolute inset-x-0 bottom-0 bg-[color-mix(in_srgb,var(--tech-blue)_35%,var(--tech-ink))]",
              BAND_TOP[n],
            )}
          />
          <div className="relative mx-auto max-w-[1240px] px-4 pb-10 pt-8">
            <ul className={cn("grid grid-cols-1 gap-x-6 gap-y-10 max-[519px]:gap-x-3 max-[519px]:gap-y-8", GRID[n])}>
              {columns.map((column, i) => (
                <li key={i} className={LAST_ODD[n]}>
                  <Reveal delay={i * 80}>
                    <figure className="mx-auto flex w-full max-w-[300px] flex-col items-center">
                      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl border-4 border-background bg-card shadow-[0_24px_50px_-28px_rgba(7,20,38,0.7)]">
                        <Media images={column.images} label={column.label} />
                      </div>
                      {column.label && (
                        <>
                          <span aria-hidden className="h-7 w-px bg-primary-foreground/50" />
                          <span
                            aria-hidden
                            className="size-3.5 rounded-full border-[3px] border-primary-foreground bg-[color:var(--tech-cyan)]"
                          />
                          <figcaption className="mt-4 text-center text-sm font-bold uppercase leading-snug tracking-[0.16em] text-primary-foreground max-[519px]:tracking-[0.1em]">
                            {column.label}
                          </figcaption>
                        </>
                      )}
                    </figure>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}

const SIZES = "(min-width: 1024px) 300px, (min-width: 640px) 45vw, 100vw";

// Hai ảnh xếp chồng trong cùng một khung (cột "Nghệ nhân"); một ảnh thì phủ kín; chưa có ảnh thì khung giữ chỗ.
function Media({ images, label }: { images: string[]; label?: string }) {
  if (images.length === 0) {
    return (
      <ImageSlot
        slot="photo-columns.items.image"
        label={label}
        className="h-full min-h-0! border-0"
      />
    );
  }
  if (images.length === 1) {
    return (
      <CloudinaryMedia
        src={images[0]}
        alt={label ?? ""}
        sizes={SIZES}
        variant="loop"
        className="object-cover"
      />
    );
  }
  return (
    <div className="grid h-full grid-rows-2 gap-0.5 bg-background">
      {images.slice(0, 2).map((src, i) => (
        <div key={src} className="relative overflow-hidden bg-card">
          <CloudinaryMedia
            src={src}
            alt={i === 0 ? (label ?? "") : ""}
            sizes={SIZES}
            variant="loop"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
