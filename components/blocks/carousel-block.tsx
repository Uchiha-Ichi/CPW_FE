"use client";

import { SectionHead } from "./shared/section-head";
import { Reveal } from "./shared/reveal";
import { CloudinaryMedia } from "./shared/cloudinary-media";
import { ImageSlot } from "./shared/image-slot";
import { cn } from "@/lib/utils";
import { list, str } from "@/lib/blocks/read";
import type { BlockProps } from "./types";
import styles from "./carousel-block.module.css";

// Số cột (trên lưới 12 cột) của từng ô: hàng đầu 7 + 5, các hàng sau 4 + 4 + 4; dư 2 ô thì 6 + 6, dư 1 ô thì 12.
function spans(n: number): number[] {
  if (n === 1) return [12];
  const out = [7, 5];
  let rest = n - 2;
  while (rest >= 3) {
    out.push(4, 4, 4);
    rest -= 3;
  }
  if (rest === 2) out.push(6, 6);
  if (rest === 1) out.push(12);
  return out;
}

// Ánh sáng chạy theo con trỏ trong ô: chỉ ghi hai biến CSS, không dùng state.
function spotlight(e: React.PointerEvent<HTMLLIElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--x", `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty("--y", `${e.clientY - rect.top}px`);
}

// Block loại "carousel": lưới ô bất đối xứng (bento). Đẹp khi chỉ có chữ; ô nào có ảnh/video thì ảnh phủ kín ô.
export function CarouselBlock({ data }: BlockProps) {
  const title = str(data.title);
  const items = list(data.items)
    .map((i) => ({ t: str(i.t), d: str(i.d), image: str(i.image) }))
    .filter((i) => i.t);
  if (!title || items.length === 0) return null;

  const cols = spans(items.length);

  return (
    <section className={cn(styles.section, "relative overflow-x-clip border-b border-border py-12 md:py-16")}>
      <div className="mx-auto max-w-[1240px] px-4">
        <Reveal>
          <SectionHead title={title} flush />
        </Reveal>
        <Reveal className="mt-8 md:mt-10">
          <ol className={styles.grid}>
            {items.map((item, i) => (
              <li
                key={i}
                className={styles.tile}
                data-feature={i < 2 ? "" : undefined}
                data-media={item.image ? "" : undefined}
                style={{ "--span": cols[i] } as React.CSSProperties}
                onPointerMove={spotlight}
              >
                {item.image && (
                  <>
                    <div aria-hidden className={styles.media}>
                      <CloudinaryMedia
                        src={item.image}
                        alt=""
                        sizes="(min-width: 768px) 50vw, 100vw"
                        variant="loop"
                        className={styles.photo}
                      />
                    </div>
                    <span aria-hidden className={styles.scrim} />
                  </>
                )}
                <span aria-hidden className={styles.num}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                {!item.image && <ImageSlot variant="chip" slot="carousel.items.image" className={styles.slot} />}
                <div className={styles.body}>
                  <h3 className={styles.title}>{item.t}</h3>
                  {item.d && <p className={styles.desc}>{item.d}</p>}
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
