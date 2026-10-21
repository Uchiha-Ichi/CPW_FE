import Image from "next/image";
import styles from "./network.module.css";
import { NetworkMap } from "./network-map";
import { RichTitle } from "../shared/rich-title";
import { getNetwork } from "@/lib/api/network";
import { cropPoint, networkRoutes, pinName, toPins } from "@/lib/blocks/network-geometry";
import { str } from "@/lib/blocks/read";
import { BLOCK_H2, BLOCK_SECTION, BLOCK_WRAP } from "@/lib/blocks/rhythm";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";
import type { BlockProps } from "../types";

// Danh sách quốc gia lấy từ GET /network/public (collection riêng), không nằm trong dữ liệu block.
// Chữ trên khối (tiêu đề, dòng mô tả, nhãn chú giải, mô tả bản đồ) đều là field của block (D21); tên nước theo D10.
export async function NetworkBlock({ data, lang }: BlockProps) {
  const network = await getNetwork();
  const pins = network.status === "ok" ? toPins(network.data) : [];
  if (pins.length === 0) return null;

  const title = str(data.title);
  const text = str(data.text);
  const liveLabel = str(data.liveLabel);
  const nextLabel = str(data.nextLabel);
  const mapLabel = str(data.mapLabel);
  const t = await getTranslations("Network");

  const named = pins.map((pin) => ({ ...pin, label: pinName(pin, lang), crop: cropPoint(pin) }));
  const groups = [
    { stage: "live", label: liveLabel, items: named.filter((p) => p.stage === "live") },
    { stage: "next", label: nextLabel, items: named.filter((p) => p.stage === "next") },
  ].filter((g) => g.items.length > 0);

  return (
    <section className={cn(BLOCK_SECTION, styles.section)}>
      <div className={cn(BLOCK_WRAP, styles.grid)}>
        <div>
          {title && (
            <h2 className={cn(BLOCK_H2, styles.title)}>
              <RichTitle text={title} />
            </h2>
          )}
          {text && <p className={styles.caption}>{text}</p>}
          <div className={styles.legend}>
            {groups.map((g) => (
              <div key={g.stage}>
                {g.label && <div className={styles.legendLabel}>{`${g.label} · ${g.items.length}`}</div>}
                <div className={styles.chips}>
                  {g.items.map((p) => (
                    <span key={p.code} className={styles.chip}>
                      {g.stage === "live" ? (
                        <span className={styles.flag} aria-hidden="true">
                          <Image
                            src={`https://flagcdn.com/w40/${p.code}.png`}
                            alt=""
                            width={40}
                            height={30}
                            unoptimized
                            className="h-full w-full object-cover"
                          />
                        </span>
                      ) : (
                        <i className={styles.nextDot} aria-hidden="true" />
                      )}
                      {p.label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <NetworkMap
            pins={named}
            routes={networkRoutes(pins)}
            mapLabel={mapLabel}
            mapCredit={t("mapCredit")}
          />
        </div>
      </div>
    </section>
  );
}
