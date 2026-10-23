import { getTranslations } from "next-intl/server";
import { BlockHead } from "./shared/block-head";
import { CloudinaryMedia } from "./shared/cloudinary-media";
import { ImageSlot } from "./shared/image-slot";
import { Reveal } from "./shared/reveal";
import { ProductListRow } from "./product-list-row";
import { str } from "@/lib/blocks/read";
import { BLOCK_SECTION, BLOCK_WRAP } from "@/lib/blocks/rhythm";
import { getPublicProducts } from "@/lib/api/products";
import { cn } from "@/lib/utils";
import type { BlockProps } from "./types";
import styles from "./product-list-block.module.css";

const PRODUCT_LIMIT = 4;

// Khối danh sách sản phẩm lấy từ bảng Sản phẩm: tối đa 4 thẻ, cùng một hàng (từ 1024px), thẻ đang chọn mở rộng và tự
// chuyển (product-list-row.tsx).
export async function ProductListBlock({ data, lang }: BlockProps) {
  const title = str(data.title);
  if (!title) return null;

  const result = await getPublicProducts(lang);
  if (result.status !== "ok" || result.data.length === 0) return null;

  const products = result.data.slice(0, PRODUCT_LIMIT);
  const t = await getTranslations({ locale: lang, namespace: "Products" });

  return (
    <section className={BLOCK_SECTION}>
      <div className={BLOCK_WRAP}>
        <Reveal>
          <BlockHead
            title={title}
            text={str(data.text)}
            titleClassName="max-w-[16em]"
          />
        </Reveal>
        <div className="mt-[30px]">
          <ProductListRow>
            {products.map((item, i) => (
              <Reveal key={item._id} delay={i * 80} className={styles.inner}>
                <div className={styles.frame}>
                  {item.image ? (
                    <div className={styles.media}>
                      <CloudinaryMedia
                        src={item.image}
                        alt=""
                        sizes="(min-width: 1024px) 40vw, 100vw"
                        variant="loop"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <ImageSlot
                      slot="product-list.image"
                      dense
                      className="absolute inset-0 min-h-0! rounded-[inherit]"
                    />
                  )}
                  {item.comingSoon && (
                    <span className={styles.badge}>{t("comingSoon")}</span>
                  )}
                </div>
                <div className={styles.text}>
                  <h3
                    className={cn(
                      styles.title,
                      "text-[22px] tracking-normal text-balance break-words",
                    )}
                  >
                    {item.name}
                  </h3>
                  {item.description && (
                    <p
                      className={cn(
                        styles.desc,
                        "text-[15.5px] leading-[1.6] text-pretty break-words text-muted-foreground",
                      )}
                    >
                      {item.description}
                    </p>
                  )}
                </div>
              </Reveal>
            ))}
          </ProductListRow>
        </div>
      </div>
    </section>
  );
}
