"use client";

import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Mouse, MoveRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { RichTitle } from "./shared/rich-title";
import { Reveal } from "./shared/reveal";
import { CloudinaryMedia } from "./shared/cloudinary-media";
import { ImageSlot } from "./shared/image-slot";
import { useAutoScroll } from "./shared/use-auto-scroll";
import { useWheelDrag } from "./shared/use-wheel-drag";
import { list, str } from "@/lib/blocks/read";
import { cn } from "@/lib/utils";
import type { BlockProps } from "./types";

// Màu chữ của thẻ: nền thẻ sáng thì dùng màu thường, có ảnh phủ kín thẻ thì chữ trắng.
const TONE = {
  plain: {
    num: "text-muted-foreground",
    dot: "bg-border",
    line: "bg-border",
    title: "text-primary",
    desc: "text-muted-foreground",
  },
  media: {
    num: "text-white/80",
    dot: "bg-white/70",
    line: "bg-white/50",
    title: "text-white",
    desc: "text-white/85",
  },
};

// Lớp tối chuyển dần từ đỉnh thẻ xuống, phủ phần có chữ, để chữ trắng đọc rõ trên mọi ảnh. Màu lấy từ token
// --tech-ink (hằng số, không đổi theo giao diện sáng/tối).
const SCRIM =
  "linear-gradient(to bottom, color-mix(in srgb, var(--tech-ink) 88%, transparent) 0%, color-mix(in srgb, var(--tech-ink) 50%, transparent) 42%, transparent 72%)";

const pad = (n: number) => String(n).padStart(2, "0");

// Ngoặc góc kiểu HUD ở bốn góc thẻ (lệch vào trong 6px, mỗi cạnh dài 14px). Hover: thẻ dâng nền xanh nên ngoặc đổi
// sang trắng để không chìm.
const CORNERS = [
  "left-1.5 top-1.5 border-l-2 border-t-2",
  "right-1.5 top-1.5 border-r-2 border-t-2",
  "bottom-1.5 left-1.5 border-b-2 border-l-2",
  "bottom-1.5 right-1.5 border-b-2 border-r-2",
];

// loop: dải lặp vòng liền mạch để tự trượt mãi theo từng thẻ. Embla chỉ lặp khi các thẻ đủ phủ khung; không đủ thì nó
// tự tắt loop và containScroll "trimSnaps" có hiệu lực (dải đứng yên, không để trống ở hai đầu). Hằng cấp module:
// useEmblaCarousel luôn nhận cùng một object nên không reInit khi render lại.
const EMBLA_OPTIONS: Parameters<typeof useEmblaCarousel>[0] = {
  align: "start",
  containScroll: "trimSnaps",
  loop: true,
};

// Mép dải mờ dần để thẻ trôi vào/ra mượt thay vì bị cắt thẳng. Mép trái chỉ mờ trong 20px (đúng khoảng đệm pl-5 của
// slide) nên thẻ đứng đầu lúc dừng vẫn rõ nét; mép phải mờ rộng hơn vì ở đó luôn có thẻ thò ra.
const EDGE_FADE =
  "[mask-image:linear-gradient(to_right,transparent,#000_20px,#000_calc(100%_-_40px),transparent)]";

function Intro({
  title,
  text,
  centered,
}: {
  title: string;
  text?: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "text-center" : undefined}>
      <h2 className="text-3xl leading-[1.12] md:text-4xl xl:text-5xl">
        <RichTitle text={title} />
      </h2>
      {text && (
        <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">{text}</p>
      )}
    </div>
  );
}

export function ProductShowcaseBlock({ data }: BlockProps) {
  const [viewportRef, api] = useEmblaCarousel(EMBLA_OPTIONS);
  useWheelDrag(api);
  const t = useTranslations("Carousel");
  // Lần render đầu (server và lúc hydrate) chưa có Embla: không tự trượt.
  const [canMove, setCanMove] = useState(false);
  const { regionProps } = useAutoScroll(api, canMove);

  // canMove = Embla đang thật sự lặp vòng (số thẻ đủ phủ khung); không lặp được thì dải đứng yên, không tự trượt.
  // Embla phát "reInit" cả khi đổi kích thước màn hình (có thể đổi giữa lặp/không lặp), nên đọc lại ở đó.
  useEffect(() => {
    if (!api) return;
    const sync = () => setCanMove(api.internalEngine().options.loop);
    sync();
    api.on("reInit", sync);
    return () => {
      api.off("reInit", sync);
    };
  }, [api]);

  const title = str(data.title);
  const items = list(data.items)
    .map((i) => ({ t: str(i.t), d: str(i.d), image: str(i.image) }))
    .filter((i) => i.t);
  if (!title || items.length === 0) return null;

  const text = str(data.text);

  // Từ xl: cột giới thiệu hẹp lại (gutter + 400px) và --card-w co theo bề ngang còn lại của dải để vừa đúng 3 thẻ nguyên
  // vẹn (mỗi thẻ cộng khoảng đệm pl-5 của nó). 140px chừa cho thẻ thứ 4 thò ra, mép mờ và thanh cuộn của trình duyệt.
  // Kẹp 240-300px: màn rộng thì thẻ đủ 300px và thẻ kế thò ra nhiều hơn.
  return (
    <section className="relative overflow-hidden border-b border-border py-10 [--gutter:max(1rem,calc((100vw_-_1240px)/2_+_1rem))] md:py-14 xl:[--card-w:clamp(240px,calc((100vw_-_var(--gutter)_-_400px_-_140px)/3),300px)]">
      {/* Dưới lg, phần giới thiệu nằm trên dải thẻ; từ lg nó đứng yên bên trái dải (không phải slide, vì dải lặp vòng).
          Mỗi lúc chỉ một bản hiển thị. */}
      <div className="mx-auto mb-10 max-w-[90%] lg:hidden">
        <Intro centered title={title} text={text} />
      </div>

      <Reveal className="relative">
        <div
          aria-hidden
          className="absolute inset-x-0 inset-y-16 hidden bg-foreground/[0.06] lg:block"
        />

        <div className="relative lg:flex">
          <div className="hidden flex-none lg:flex">
            <div className="flex w-[calc(var(--gutter)+520px)] flex-col justify-center pl-[var(--gutter)] pr-12 xl:w-[calc(var(--gutter)+400px)] xl:pr-8">
              <Intro title={title} text={text} />
              <div className="mt-10 flex select-none items-center gap-2 text-muted-foreground">
                <Mouse aria-hidden className="h-6 w-6 opacity-60" />
                <span className="text-sm font-semibold uppercase tracking-wide">{t("hint")}</span>
                <MoveRight aria-hidden className="h-6 w-6 opacity-60" />
              </div>
            </div>
          </div>

          <div
            ref={viewportRef}
            className={cn(
              "relative min-w-0 cursor-grab overflow-hidden overscroll-x-contain py-8 active:cursor-grabbing lg:flex-1",
              EDGE_FADE,
            )}
            role="region"
            aria-roledescription="carousel"
            aria-label={t("region")}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") api?.scrollPrev();
              if (e.key === "ArrowRight") api?.scrollNext();
            }}
            {...regionProps}
          >
            <div className="flex touch-pan-y" aria-live="off">
              {items.map((item, i) => {
                const tone = item.image ? TONE.media : TONE.plain;
                return (
                  <div
                    key={i}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${i + 1} / ${items.length}`}
                    className="flex-none pl-5"
                  >
                    <article className="group relative flex h-full min-h-[440px] w-[248px] flex-col overflow-hidden border-b-[5px] border-primary bg-card shadow-[0_0_32px_0_rgba(0,0,0,0.16)] transition-colors duration-300 hover:border-b-primary-foreground motion-reduce:transition-none sm:w-[280px] lg:min-h-[500px] lg:w-[300px] xl:min-h-[calc(var(--card-w)_*_5_/_3)] xl:w-[var(--card-w)]">
                      {/* Ảnh (hoặc video) phủ kín cả thẻ, chữ nằm đè lên phía trên. Chưa có ảnh thì hiện khung giữ chỗ cũng phủ cả thẻ. */}
                      {item.image ? (
                        <>
                          <CloudinaryMedia
                            src={item.image}
                            alt={item.t ?? ""}
                            sizes="300px"
                            variant="loop"
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
                          />
                          <span aria-hidden className="absolute inset-0" style={{ backgroundImage: SCRIM }} />
                        </>
                      ) : (
                        <ImageSlot
                          slot="product-showcase.items.image"
                          label={item.t}
                          dense
                          className="absolute inset-3 z-10 min-h-0 justify-end rounded-br-[20px] rounded-tl-[20px] text-muted-foreground transition-colors duration-300 group-hover:text-primary-foreground motion-reduce:transition-none"
                        />
                      )}
                      {/* Lớp nền xanh dâng từ đáy thẻ khi hover; có ảnh thì xanh trong suốt để vẫn thấy sản phẩm. */}
                      <span
                        aria-hidden
                        className={cn(
                          "absolute inset-0 translate-y-full transition-transform duration-500 ease-in-out group-hover:translate-y-0 motion-reduce:transition-none",
                          item.image ? "bg-primary/70" : "bg-primary",
                        )}
                      />
                      {CORNERS.map((corner) => (
                        <span
                          key={corner}
                          aria-hidden
                          className={cn(
                            "pointer-events-none absolute z-20 h-3.5 w-3.5 border-primary transition-colors duration-300 group-hover:border-primary-foreground motion-reduce:transition-none",
                            corner,
                          )}
                        />
                      ))}
                      <div className="relative z-10 flex flex-1 flex-col p-6">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "text-xs font-semibold tabular-nums tracking-widest transition-colors duration-300 group-hover:text-primary-foreground motion-reduce:transition-none",
                              tone.num,
                            )}
                          >
                            {pad(i + 1)} / {pad(items.length)}
                          </span>
                          <span
                            aria-hidden
                            className={cn(
                              "h-2 w-2 rounded-full transition-colors duration-300 group-hover:bg-primary-foreground motion-reduce:transition-none",
                              tone.dot,
                            )}
                          />
                          <span
                            aria-hidden
                            className={cn(
                              "h-[2px] flex-1 transition-colors duration-300 group-hover:bg-primary-foreground motion-reduce:transition-none",
                              tone.line,
                            )}
                          />
                        </div>
                        <h3
                          className={cn(
                            "mt-6 text-2xl leading-[1.2] transition-colors duration-300 group-hover:text-primary-foreground motion-reduce:transition-none",
                            tone.title,
                          )}
                        >
                          {item.t}
                        </h3>
                        {item.d && (
                          <p
                            className={cn(
                              "mt-3 text-sm leading-relaxed transition-colors duration-300 group-hover:text-primary-foreground/85 motion-reduce:transition-none",
                              tone.desc,
                            )}
                          >
                            {item.d}
                          </p>
                        )}
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
