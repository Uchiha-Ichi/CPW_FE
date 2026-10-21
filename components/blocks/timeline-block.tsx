import styles from "./timeline-block.module.css";
import { BlockHead } from "./shared/block-head";
import { list, str } from "@/lib/blocks/read";
import { BLOCK_SECTION, BLOCK_WRAP } from "@/lib/blocks/rhythm";
import type { BlockProps } from "./types";

interface TimelineItem {
  t: string;
  d?: string;
}

export function TimelineBlock({ data }: BlockProps) {
  const title = str(data.title);
  if (!title) return null;

  const rawItems = list(data.items);
  const items: TimelineItem[] = [];
  for (const raw of rawItems) {
    const t = str(raw.t);
    if (!t) continue;
    const d = str(raw.d);
    items.push({ t, ...(d ? { d } : {}) });
  }

  if (items.length < 2) return null;

  return (
    <section className={BLOCK_SECTION}>
      <div className={BLOCK_WRAP}>
        <BlockHead title={title} titleClassName="max-w-[16em]" />
        <ol className={styles.list} style={{ "--n": items.length } as React.CSSProperties}>
          {items.map((item, i) => (
            <li key={i} className={styles.item}>
              <span aria-hidden="true" className={styles.dot} />
              <h3 className={styles.title}>{item.t}</h3>
              {item.d && <p className={styles.desc}>{item.d}</p>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
