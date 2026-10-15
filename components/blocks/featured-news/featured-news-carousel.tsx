"use client";

import { useEffect, useState, type CSSProperties } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowUpRight } from "lucide-react";
import { CloudinaryImage } from "../shared/cloudinary-image";
import { useAutoScroll } from "../shared/use-auto-scroll";
import { useWheelDrag } from "../shared/use-wheel-drag";
import { ImagePlaceholder } from "@/components/shared/image-placeholder";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

// Một bài nổi bật đã chuẩn bị sẵn ở server (featured-news-block.tsx): chữ đã dịch, ngày đã format.
export interface FeaturedNewsItem {
  slug: string;
  title: string;
  coverUrl?: string;
  categoryLabel: string;
  dateLabel?: string;
  dateTime?: string;
}

// Nhãn đã dịch ở server: NextIntlClientProvider của layout chỉ chuyển Header/Carousel/Errors xuống client.
export interface FeaturedNewsLabels {
  region: string;
  slide: string[]; // "Tin {n} / {total}" của từng thẻ
  detail: string; // "Chi tiết" ở đáy mỗi thẻ
}

// Tin phụ thu nhỏ bằng thuộc tính CSS `scale` (tin chính 1): không đổi kích thước thật nên bố cục không xô lệch và
// Embla không phải đo lại. Ảnh, chữ và nút của tin chính to hơn theo cùng tỉ lệ (không đặt cỡ chữ riêng).
const SIDE_SCALE = 0.78;
// Thu nhỏ quanh tâm làm mép trong của tin phụ lùi xa tin chính (1 - SIDE_SCALE) / 2 bề ngang thẻ. Chỉ dưới md (thẻ
// rộng 78% khung) mới dịch tin phụ về phía tin chính đúng chừng đó (thuộc tính CSS `translate`, % theo bề ngang thẻ):
// không dịch thì phần tin phụ thò ra hai bên bị thu nhỏ mất hẳn. Từ md trở lên không dịch: thu nhỏ quanh tâm tự cho khe
// rộng giữa các thẻ và lề ngoài cân đối như ảnh mẫu.
const SIDE_SHIFT = `${(((1 - SIDE_SCALE) / 2) * 100).toFixed(2)}%`;

// Thẻ i nằm bên trái (-1) hay bên phải (1) tin chính; 0 là tin chính. Chỉ dùng cho translate dưới md. Không lặp vòng:
// theo thứ tự. Lặp vòng: thẻ ngay sau tin chính ở bên phải, ngay trước ở bên trái (đúng như Embla xếp); các thẻ xa hơn
// nằm ngoài màn hình nên chia đôi vòng cho đơn giản, phía của chúng không thấy được.
function sideOf(i: number, selected: number, count: number, looping: boolean): -1 | 0 | 1 {
  if (i === selected) return 0;
  if (!looping) return i < selected ? -1 : 1;
  return (i - selected + count) % count <= (count - 1) / 2 ? 1 : -1;
}

// Hằng cấp module: useEmblaCarousel luôn nhận cùng một object nên không reInit khi render lại.
// containScroll: false: khi Embla tự tắt loop (ít thẻ), mỗi thẻ vẫn có điểm dừng căn giữa thay vì bị dạt ra mép.
const EMBLA_OPTIONS: Parameters<typeof useEmblaCarousel>[0] = {
  loop: true,
  align: "center",
  containScroll: false,
};

export function FeaturedNewsCarousel({
  items,
  labels,
}: {
  items: FeaturedNewsItem[];
  labels: FeaturedNewsLabels;
}) {
  const [viewportRef, api] = useEmblaCarousel(EMBLA_OPTIONS);
  useWheelDrag(api);
  // Lần render đầu (server và lúc hydrate) chưa có Embla: thẻ đầu là tin chính, không tự lướt.
  const [selected, setSelected] = useState(0);
  const [canMove, setCanMove] = useState(false);
  const { regionProps } = useAutoScroll(api, canMove);

  // Tin chính = thẻ Embla đang chọn (align "center" nên là thẻ nằm giữa khung).
  // canMove = Embla đang thật sự lặp vòng: khi số thẻ không đủ phủ khung, Embla tự tắt loop nhưng vẫn giữ một điểm
  // dừng cho mỗi thẻ, nên canScrollNext()/canScrollPrev() vẫn true; đọc cờ loop thật của engine thay vào đó.
  // Không lặp được thì đặt ngay (không hoạt ảnh) thẻ floor((N-1)/2) vào giữa: 1 tin: tin đó, 2 tin: tin đầu,
  // 3 tin: tin giữa. Embla phát "reInit" cả khi đổi cỡ màn hình (có thể đổi giữa lặp/không lặp), nên tính lại ở đó.
  useEffect(() => {
    if (!api) return;
    const onSelect = () => setSelected(api.selectedScrollSnap());
    const onReInit = () => {
      const looping = api.internalEngine().options.loop;
      setCanMove(looping);
      if (!looping) api.scrollTo(Math.floor((api.scrollSnapList().length - 1) / 2), true);
      onSelect();
    };
    onReInit();
    api.on("select", onSelect).on("reInit", onReInit);
    return () => {
      api.off("select", onSelect).off("reInit", onReInit);
    };
  }, [api]);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={labels.region}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") api?.scrollPrev();
        if (e.key === "ArrowRight") api?.scrollNext();
      }}
      {...regionProps}
    >
      {/* Viewport overflow-hidden: chừa chỗ (padding, bù bằng margin âm để bố cục ngoài không đổi) cho viền focus và
          bóng đổ của tin chính, không bị cắt ngang. Bóng lệch xuống dưới nên phần dưới chừa nhiều hơn phần trên. */}
      <div ref={viewportRef} className="-mx-1 -mt-4 -mb-20 overflow-hidden px-1 pt-4 pb-20">
        {/* Khoảng cách giữa các thẻ là padding trong thẻ (-ml-4 + pl-4), cách chuẩn của Embla. Từ lg mỗi thẻ đúng 1/3
            khung nên cả ba thẻ hiện nguyên vẹn. */}
        <div className="-ml-4 flex touch-pan-y touch-pinch-zoom" aria-live="off">
          {items.map((item, i) => {
            const side = sideOf(i, selected, items.length, canMove);
            const isMain = side === 0;
            return (
              <div
                key={item.slug}
                role="group"
                aria-roledescription="slide"
                aria-label={labels.slide[i]}
                // Tin chính nằm trên hai tin phụ (bóng đổ của nó phủ lên, không bị thẻ bên che). Đặt ở thẻ bọc vì Embla
                // gắn transform lên thẻ bọc khi lặp vòng (tạo stacking context riêng cho từng thẻ).
                className={cn(
                  "min-w-0 shrink-0 grow-0 basis-[78%] pl-4 md:basis-[46%] lg:basis-1/3",
                  isMain && "relative z-10",
                )}
              >
                {/* Chính/phụ chỉ đổi scale, viền, bóng và (dưới md) translate, không đổi kích thước thật. Mọi thẻ
                    nền đặc bg-card, không dùng opacity: hoa văn nền trang không được lộ xuyên qua thẻ. Bấm tin phụ:
                    không mở bài mà đưa nó vào giữa; bấm tin chính: mở bài. Kéo xong thì Embla tự chặn click (listener
                    click ở pha capture trên viewport) nên không mở bài ngoài ý muốn. */}
                <Link
                  href={`/news/${encodeURIComponent(item.slug)}`}
                  onClick={(e) => {
                    if (isMain || !api) return;
                    // Ctrl/Cmd/Shift/Alt + bấm: để trình duyệt mở tab/cửa sổ mới như liên kết thường.
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                    e.preventDefault();
                    api.scrollTo(i);
                  }}
                  // --side-shift chỉ được dùng dưới md (lớp max-md:[translate:...], tức @media (width < 48rem)); tin
                  // chính 0% để trượt về tâm mượt. Từ md trở lên không có translate.
                  style={
                    {
                      scale: isMain ? 1 : SIDE_SCALE,
                      "--side-shift": isMain ? "0%" : side < 0 ? SIDE_SHIFT : `-${SIDE_SHIFT}`,
                    } as CSSProperties
                  }
                  className={cn(
                    "group flex h-full flex-col overflow-hidden rounded-2xl border bg-card outline-hidden focus-visible:ring-2 focus-visible:ring-ring max-md:[translate:var(--side-shift)] motion-safe:transition-[scale,translate,box-shadow,border-color] motion-safe:duration-500 motion-safe:ease-out",
                    isMain
                      ? "border-primary/50 shadow-[0_32px_60px_-28px_rgba(23,125,242,0.45)]"
                      : "border-border shadow-[0_18px_44px_-26px_rgba(7,20,38,0.32)] hover:border-primary/40",
                  )}
                >
                  <div aria-hidden className="relative aspect-video overflow-hidden">
                    {item.coverUrl ? (
                      <CloudinaryImage
                        src={item.coverUrl}
                        alt=""
                        fill
                        sizes="(min-width: 1240px) 400px, (min-width: 1024px) 33vw, (min-width: 768px) 46vw, 78vw"
                        className="object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-105"
                      />
                    ) : (
                      <ImagePlaceholder label={item.title} className="h-full border-0" />
                    )}
                  </div>
                  {/* Vạch xanh ngăn ảnh với phần chữ: ảnh nền trắng (logo) không chìm vào nền thẻ. Tin chính dày và
                      đậm hơn. Màu có alpha trên nền thẻ đặc, không phải opacity. Khe ngoài cố định h-1.5 cho mọi thẻ:
                      độ dày vạch không đổi chiều cao thẻ, nên dải không nhích khi đổi tin chính. */}
                  <div aria-hidden className="h-1.5 shrink-0">
                    <div className={isMain ? "h-full bg-primary" : "h-1 bg-primary/55"} />
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-5 md:p-6">
                    {/* Thẻ hẹp (điện thoại): ngày xuống dòng nguyên cụm thay vì cả hai cụm cùng gãy đôi. */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <span className="text-primary">{item.categoryLabel}</span>
                      {item.dateLabel && (
                        <time dateTime={item.dateTime} className="whitespace-nowrap">
                          {item.dateLabel}
                        </time>
                      )}
                    </div>
                    {/* -mt-1 pt-1: line-clamp cắt theo khung chữ, chừa chỗ cho dấu tiếng Việt chồng ở dòng đầu.
                        min-h dành sẵn đủ 3 dòng (3 × 1.2em, cộng pt-1) nên mọi thẻ cao bằng nhau dù tiêu đề ngắn. */}
                    <h3 className="-mt-1 line-clamp-3 min-h-[calc(3.6em_+_0.25rem)] pt-1 text-lg font-bold leading-[1.2] group-hover:text-primary motion-safe:transition-colors md:text-xl">
                      {item.title}
                    </h3>
                    {/* Chỉ là chữ trong thẻ (cả thẻ đã là liên kết), không phải liên kết lồng nhau. */}
                    <span className="mt-auto inline-flex items-center gap-1.5 self-start pt-1 text-sm font-semibold text-primary">
                      {labels.detail}
                      <ArrowUpRight aria-hidden className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
