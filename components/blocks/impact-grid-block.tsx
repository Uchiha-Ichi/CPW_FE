import styles from "./impact-grid-block.module.css";
import { BlockHead } from "./shared/block-head";
import { CountText } from "./shared/count-text";
import { Reveal } from "./shared/reveal";
import { list, str } from "@/lib/blocks/read";
import { BLOCK_SECTION, BLOCK_WRAP } from "@/lib/blocks/rhythm";
import { cn } from "@/lib/utils";
import type { BlockProps } from "./types";

// Khối "Tầm ảnh hưởng": số đầu tiên cỡ lớn bên trái (chiếm mọi hàng), các số còn lại thành dòng phẳng bên phải
// (mockup BẢN 65 dòng 933–937, CSS 519–536). Không hộp, không icon. Mọi chữ lấy từ data (D21).
export function ImpactGridBlock({ data, lang }: BlockProps) {
  const title = str(data.title);
  const items = list(data.items)
    .map((it) => ({ value: str(it.value), t: str(it.t), d: str(it.d) }))
    .filter((it): it is { value: string; t: string; d: string | undefined } =>
      Boolean(it.value && it.t),
    );
  if (!title || items.length < 2) return null;

  const [lead, ...rows] = items;

  return (
    <section className={cn(BLOCK_SECTION, styles.root)}>
      <div className={BLOCK_WRAP}>
        <BlockHead title={title} />
        <div
          className={styles.grid}
          style={{ "--ig-span": rows.length } as React.CSSProperties}
        >
          <Reveal className={styles.lead}>
            <b className={styles.leadValue}>
              <CountText text={lead.value} lang={lang} />
            </b>
            <h3 className={styles.leadTitle}>{lead.t}</h3>
            {lead.d && <p className={styles.leadText}>{lead.d}</p>}
          </Reveal>
          {rows.map((it, k) => (
            <Reveal key={k} className={styles.row} delay={(k + 1) * 90}>
              <b className={styles.value}>
                <CountText text={it.value} lang={lang} />
              </b>
              <h3 className={styles.rowTitle}>{it.t}</h3>
              {it.d && <p className={styles.rowText}>{it.d}</p>}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
