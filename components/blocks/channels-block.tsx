import type { CSSProperties } from "react";
import { BRAND_COLOR, BrandLogo, brandKey } from "./shared/brand-logo";
import { Reveal } from "./shared/reveal";
import { RichTitle } from "./shared/rich-title";
import { CountUp } from "./stats-block";
import { list, num, str } from "@/lib/blocks/read";
import { cn } from "@/lib/utils";
import type { BlockProps } from "./types";
import styles from "./channels-block.module.css";

// Số ô trên mỗi hàng của bảng nền tảng, theo tổng số nền tảng (registry cho tối đa 8). Hàng nào cũng lấp đầy bề
// ngang (lưới 12 cột): 5 nền tảng thành hàng 3 ô rồi hàng 2 ô rộng hơn, không để ô lẻ.
const ROWS: Record<number, number[]> = {
  1: [1],
  2: [2],
  3: [3],
  4: [2, 2],
  5: [3, 2],
  6: [3, 3],
  7: [3, 4],
  8: [4, 4],
};

function perRow(total: number, index: number): number {
  let start = 0;
  for (const size of ROWS[total] ?? [total]) {
    if (index < start + size) return size;
    start += size;
  }
  return 1;
}

// Block loại "channels": hệ thống kênh mạng xã hội. Bên trái là các con số, bên phải là bảng logo các nền tảng.
// Không có nền tảng nào thì chỉ còn phần số liệu, rộng hết khung.
export function ChannelsBlock({ data, lang }: BlockProps) {
  const title = str(data.title);
  const items = list(data.items)
    .map((i) => ({ value: num(i.value), suffix: str(i.suffix) ?? "", label: str(i.label) }))
    .filter((i): i is { value: number; suffix: string; label: string } => i.value !== undefined && Boolean(i.label));
  const platforms = list(data.platforms)
    .map((p) => str(p.t))
    .filter((t): t is string => Boolean(t));
  if (!title || items.length === 0) return null;

  const locale = lang === "vi" ? "vi-VN" : "en-US";

  return (
    <section className={cn(styles.section, "relative overflow-x-clip border-b border-border py-12 md:py-16")}>
      <div className={cn(styles.layout, "mx-auto max-w-[1240px] px-4")} data-wall={platforms.length > 0 ? "" : undefined}>
        <div>
          <Reveal>
            <h2 className="max-w-xl text-3xl font-bold leading-[1.12] md:text-5xl">
              <RichTitle text={title} />
            </h2>
          </Reveal>
          <dl className={styles.numbers}>
            {items.map((item, i) => (
              <Reveal key={i} delay={i * 80} className={styles.number}>
                <dt className={styles.label}>{item.label}</dt>
                <dd className={styles.value}>
                  <CountUp value={item.value} locale={locale} />
                  {item.suffix && (
                    <span className={/^\p{L}/u.test(item.suffix) ? styles.unit : undefined}>{item.suffix}</span>
                  )}
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>

        {platforms.length > 0 && (
          <ul className={styles.wall}>
            {platforms.map((name, i) => {
              const per = perRow(platforms.length, i);
              const brand = brandKey(name);
              const cellStyle = {
                "--span": 12 / per,
                "--brand": (brand && BRAND_COLOR[brand]) || "var(--foreground)",
              } as CSSProperties;
              return (
                <li key={name + i} className={styles.cell} style={cellStyle} data-per={per}>
                  <Reveal delay={i * 70} className={styles.tile}>
                    {brand ? (
                      <BrandLogo brand={brand} className={styles.mark} />
                    ) : (
                      <span aria-hidden className={styles.monogram}>
                        {name.charAt(0)}
                      </span>
                    )}
                    <span className={styles.name}>{name}</span>
                    {/* Logo cùng nền tảng, cỡ lớn, rất mờ, cắt ở góc ô: họa tiết nền, không mang nghĩa. */}
                    {brand && <BrandLogo brand={brand} className={styles.ghost} />}
                  </Reveal>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
