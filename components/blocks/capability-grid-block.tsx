import styles from "./capability-grid-block.module.css";
import { BlockHead } from "./shared/block-head";
import { Reveal } from "./shared/reveal";
import { ImageSlot } from "./shared/image-slot";
import { CloudinaryMedia } from "./shared/cloudinary-media";
import { list, str } from "@/lib/blocks/read";
import { BLOCK_WRAP } from "@/lib/blocks/rhythm";
import type { BlockProps } from "./types";

interface CapabilityItem {
  t: string;
  d?: string;
  image?: string;
}

export function CapabilityGridBlock({ data }: BlockProps) {
  const title = str(data.title);
  if (!title) return null;

  const rawItems = list(data.items);
  const items: CapabilityItem[] = [];
  for (const raw of rawItems) {
    const t = str(raw.t);
    if (!t) continue;
    const d = str(raw.d);
    const image = str(raw.image);
    items.push({ t, ...(d ? { d } : {}), ...(image ? { image } : {}) });
  }

  if (items.length === 0) return null;

  const cols = Math.min(items.length, 4);

  return (
    <section className={styles.section}>
      <div className={BLOCK_WRAP}>
        <BlockHead
          title={title}
          titleClassName="text-white [&_em]:text-[var(--vcb-champagne)]"
        />
        <div
          className={styles.grid}
          style={{ "--cols": cols } as React.CSSProperties}
        >
          {items.map((item, k) => (
            <Reveal key={k} delay={k * 110} className="h-full">
              {/* --i: thứ tự thẻ, để CSS lệch pha hiệu ứng thu/phóng thành làn sóng từ trái sang phải. */}
              <div
                className={styles.card}
                style={{ "--i": k } as React.CSSProperties}
              >
                <div className={styles.photo}>
                  {item.image ? (
                    <CloudinaryMedia
                      src={item.image}
                      alt={item.t}
                      variant="loop"
                      sizes="(min-width: 1101px) 25vw, (min-width: 601px) 50vw, 100vw"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageSlot
                      slot="capability-grid.items.image"
                      dense
                      className="h-full w-full border-white/20 text-white/85"
                    />
                  )}
                </div>
                <div className={styles.content}>
                  <h3 className={styles.title}>{item.t}</h3>
                  {item.d && <p className={styles.desc}>{item.d}</p>}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
