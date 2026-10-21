import { BlockHead } from "./shared/block-head";
import { CloudinaryMedia } from "./shared/cloudinary-media";
import { ImageSlot } from "./shared/image-slot";
import { Reveal } from "./shared/reveal";
import { list, str } from "@/lib/blocks/read";
import { BLOCK_SECTION, BLOCK_WRAP } from "@/lib/blocks/rhythm";
import type { BlockProps } from "./types";
import styles from "./card-grid-block.module.css";

// Lưới thẻ tĩnh 3 cột (1–6 thẻ; từ thẻ thứ 4 xuống hàng), ≤860px một cột. Số thứ tự sinh từ vị trí thẻ, không phải nội dung.
export function CardGridBlock({ data }: BlockProps) {
  const title = str(data.title);
  if (!title) return null;

  const items = list(data.items)
    .map((i) => ({ t: str(i.t), d: str(i.d), image: str(i.image) }))
    .filter((i): i is { t: string; d: string | undefined; image: string | undefined } => Boolean(i.t));
  if (items.length === 0) return null;

  return (
    <section className={BLOCK_SECTION}>
      <div className={BLOCK_WRAP}>
        <Reveal>
          <BlockHead title={title} text={str(data.text)} titleClassName="max-w-[16em]" />
        </Reveal>
        <Reveal className="mt-[30px]">
          <ul className={styles.grid} role="list">
            {items.map((item, i) => (
              <li key={i} className={styles.cell}>
                <div className="relative aspect-[3/2] overflow-hidden rounded-[12px]">
                  {item.image ? (
                    <CloudinaryMedia
                      src={item.image}
                      alt=""
                      sizes="(min-width: 861px) 33vw, 100vw"
                      variant="loop"
                      className="object-cover"
                    />
                  ) : (
                    <ImageSlot
                      slot="card-grid.items.image"
                      dense
                      className="absolute inset-0 min-h-0! rounded-[inherit]"
                    />
                  )}
                </div>
                <span
                  aria-hidden="true"
                  className="font-display text-[14px] font-semibold leading-[1.6] tracking-[.08em] text-muted-foreground"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-[22px] tracking-normal text-balance break-words">{item.t}</h3>
                {item.d && (
                  <p className="text-[15.5px] leading-[1.6] text-pretty break-words text-muted-foreground">{item.d}</p>
                )}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
