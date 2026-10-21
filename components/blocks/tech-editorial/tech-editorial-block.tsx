import { Fragment } from "react";
import styles from "./tech-editorial.module.css";
import { Orbit, type OrbitSat } from "./orbit";
import { CountText } from "../shared/count-text";
import { Reveal } from "../shared/reveal";
import { RichTitle } from "../shared/rich-title";
import { list, str } from "@/lib/blocks/read";
import { BLOCK_SECTION, BLOCK_WRAP } from "@/lib/blocks/rhythm";
import { cn } from "@/lib/utils";
import type { BlockProps } from "../types";

// Danh sách `{ t }` thành mảng chữ, bỏ ô trống.
function texts(value: unknown): string[] {
  return list(value)
    .map((item) => str(item.t))
    .filter((t): t is string => Boolean(t));
}

// Vệ tinh chỉ có khi có `<key>Title`; AI → IP → Global là thứ tự cố định (D21).
const SAT_KEYS = ["ai", "ip", "global"] as const;

// Khối công nghệ: tiêu đề, số lớn đếm lên + 2 số phụ, quỹ đạo logo, 2 khối xám ở chân (mockup BẢN 65 dòng 833–872).
// Mọi chữ lấy từ data (D21); không có chữ viết cứng.
export function TechEditorialBlock({ data, lang }: BlockProps) {
  const title = str(data.title);
  if (!title) return null;

  const text = str(data.text);
  const period = str(data.period);
  const value = str(data.value);
  const valueLabel = str(data.valueLabel);
  const platforms = texts(data.platforms);
  const markets = texts(data.markets);
  const stats = list(data.stats)
    .map((s) => ({ value: str(s.value), text: str(s.text) }))
    .filter((s): s is { value: string; text: string | undefined } => Boolean(s.value));
  const foot = list(data.foot)
    .map((f) => ({ t: str(f.t), d: str(f.d) }))
    .filter((f): f is { t: string; d: string | undefined } => Boolean(f.t));

  const sats: OrbitSat[] = SAT_KEYS.flatMap((key) => {
    const satTitle = str(data[`${key}Title`]);
    if (!satTitle) return [];
    const chips = list(data[`${key}Chips`]).flatMap((c) => {
      const t = str(c.t);
      if (!t) return [];
      const flag = str(c.flag);
      return [{ t, flag: flag && /^[a-z]{2}$/.test(flag) ? flag : undefined }];
    });
    return [{ key, title: satTitle, text: str(data[`${key}Text`]), chips }];
  });

  const hasBig = Boolean(period || value || valueLabel || platforms.length > 0);

  return (
    <section className={cn(BLOCK_SECTION, styles.root)}>
      <div className={BLOCK_WRAP}>
        <Reveal>
          <h2 className={styles.title}>
            <RichTitle text={title} />
          </h2>
          {text && <p className={styles.sub}>{text}</p>}
        </Reveal>

        <div className={styles.top}>
          <div>
            {hasBig && (
              <Reveal delay={60}>
                {period && <div className={styles.kicker}>{period}</div>}
                {value && (
                  <div className={styles.number}>
                    <CountText text={value} lang={lang} />
                  </div>
                )}
                {valueLabel && <div className={styles.label}>{valueLabel}</div>}
                {platforms.length > 0 && (
                  <p className={styles.platforms}>
                    {platforms.map((p, i) => (
                      <Fragment key={i}>
                        {i > 0 && " · "}
                        <span className={styles.nw}>{p}</span>
                      </Fragment>
                    ))}
                  </p>
                )}
              </Reveal>
            )}
            {stats.length > 0 && (
              <Reveal className={styles.two} delay={140}>
                {stats.map((s, i) => {
                  // Thị trường nối sau câu của số phụ cuối.
                  const withMarkets = i === stats.length - 1 && markets.length > 0;
                  return (
                    <div key={i}>
                      <b className={styles.statValue}>
                        <CountText text={s.value} lang={lang} />
                      </b>
                      {(s.text || withMarkets) && (
                        <p className={styles.statText}>
                          {s.text}
                          {s.text && withMarkets && " "}
                          {withMarkets &&
                            markets.map((m, j) => (
                              <Fragment key={j}>
                                {j > 0 && ", "}
                                <span className={styles.nw}>{m}</span>
                              </Fragment>
                            ))}
                          {withMarkets && "."}
                        </p>
                      )}
                    </div>
                  );
                })}
              </Reveal>
            )}
          </div>
          <Reveal delay={120}>
            <Orbit sats={sats} label={str(data.orbitLabel)} />
          </Reveal>
        </div>

        {foot.length > 0 && (
          <div className={styles.foot}>
            {foot.map((f, k) => (
              <Reveal key={k} className={styles.footCard} delay={k * 110}>
                <h3 className={styles.footTitle}>{f.t}</h3>
                {f.d && <p className={styles.footText}>{f.d}</p>}
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
