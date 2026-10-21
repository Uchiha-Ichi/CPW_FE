import styles from "./project-strip-block.module.css";
import { BlockHead } from "./shared/block-head";
import { ImageSlot } from "./shared/image-slot";
import { CloudinaryMedia } from "./shared/cloudinary-media";
import { list, str } from "@/lib/blocks/read";
import { repeatToMin } from "@/lib/blocks/marquee";
import { BLOCK_SECTION, BLOCK_WRAP } from "@/lib/blocks/rhythm";
import { cn } from "@/lib/utils";
import type { BlockProps } from "./types";

interface ProjectItem {
  image: string;
  t?: string;
  d?: string;
}

function Banner({
  item,
  hidden,
  isDup,
}: {
  item: ProjectItem;
  hidden?: boolean;
  isDup?: boolean;
}) {
  const hasText = item.t || item.d;
  return (
    <article
      className={cn(styles.banner, isDup && styles.dup)}
      aria-hidden={hidden ? "true" : undefined}
    >
      <CloudinaryMedia
        src={item.image}
        alt={hidden ? "" : item.t || ""}
        variant="loop"
        sizes="min(420px, 82vw)"
        className="h-full w-full object-cover"
      />
      {hasText && (
        <div className={styles.bt}>
          {item.t && <b className={styles.btTitle}>{item.t}</b>}
          {item.d && <span className={styles.btDesc}>{item.d}</span>}
        </div>
      )}
    </article>
  );
}

export function ProjectStripBlock({ data }: BlockProps) {
  const title = str(data.title);
  if (!title) return null;

  const rawItems = list(data.items);
  const items: ProjectItem[] = [];
  for (const raw of rawItems) {
    const image = str(raw.image);
    if (!image) continue;
    const t = str(raw.t);
    const d = str(raw.d);
    items.push({ image, ...(t ? { t } : {}), ...(d ? { d } : {}) });
  }

  if (items.length === 0) {
    return (
      <section className={BLOCK_SECTION}>
        <div className={BLOCK_WRAP}>
          <BlockHead title={title} titleClassName="max-w-[16em]" />
        </div>
        <div className="mt-7 overflow-x-auto px-4">
          <div className="mx-auto flex max-w-[1240px] gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className={styles.emptySlot}>
                <ImageSlot
                  slot="project-strip.items.image"
                  className="h-full w-full border-0"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const fullList = repeatToMin(items, 6);

  return (
    <section className={BLOCK_SECTION}>
      <div className={BLOCK_WRAP}>
        <BlockHead title={title} titleClassName="max-w-[16em]" />
      </div>
      <div
        className={cn("vcb-marquee", styles.marquee)}
        role="region"
        aria-label={title.replace(/\*/g, "")}
      >
        <div
          className={cn("vcb-marquee-track", styles.track)}
          style={{ "--vcb-marquee-duration": `${items.length * 7}s` } as React.CSSProperties}
        >
          <div className={styles.set}>
            {fullList.map((item, i) => (
              <Banner
                key={i}
                item={item}
                hidden={i >= items.length}
                isDup={i >= items.length}
              />
            ))}
          </div>
          <div className={styles.set} aria-hidden="true">
            {fullList.map((item, i) => (
              <Banner key={i} item={item} hidden isDup={false} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
