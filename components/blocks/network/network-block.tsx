import styles from "./network.module.css";
import { NetworkMap } from "./network-map";
import { Eyebrow } from "../shared/eyebrow";
import { RichTitle } from "../shared/rich-title";
import { getNetwork } from "@/lib/api/network";
import { routesFrom, toPins } from "@/lib/blocks/network-geometry";
import { str } from "@/lib/blocks/read";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";
import type { BlockProps } from "../types";

// Danh sách quốc gia lấy từ GET /network/public (collection riêng), không nằm trong dữ liệu block.
export async function NetworkBlock({ data }: BlockProps) {
  const network = await getNetwork();
  const pins = network.status === "ok" ? toPins(network.data) : [];
  if (pins.length === 0) return null;

  const kicker = str(data.kicker);
  const title = str(data.title);
  const t = await getTranslations("Network");

  return (
    <section
      className={cn(styles.globalNetwork, "mx-auto w-full max-w-[1240px] px-4")}
      aria-label={title ? undefined : t("routes")}
    >
      {(kicker || title) && (
        <div className="mb-8">
          {kicker && <Eyebrow className="mb-3">{kicker}</Eyebrow>}
          {title && (
            <h2 className="max-w-[16ch] text-4xl font-medium leading-[1.12] md:text-5xl lg:text-6xl">
              <RichTitle text={title} />
            </h2>
          )}
        </div>
      )}
      <NetworkMap pins={pins} routes={routesFrom(pins)} legend={t("routes")} mapCredit={t("mapCredit")} />
    </section>
  );
}
