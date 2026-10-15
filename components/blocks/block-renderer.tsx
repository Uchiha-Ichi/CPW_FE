import { Fragment } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { PublicBlock } from "@/lib/blocks/types";
import { partitionBlocks } from "@/lib/blocks/select";
import { BLOCK_COMPONENTS } from "./registry";

export function BlockRenderer({
  blocks,
  lang,
}: {
  blocks: PublicBlock[];
  lang: Locale;
}) {
  const { items, unknownTypes } = partitionBlocks(blocks, BLOCK_COMPONENTS);
  if (unknownTypes.length > 0) {
    console.warn(`BlockRenderer: bỏ qua block lạ: ${unknownTypes.join(", ")}`);
  }
  return (
    <>
      {items.map(({ block, component: Component }) => (
        <Fragment key={block.id}>
          {/* Mốc để liên kết "/trang#<id của block>" (ví dụ nút ở hero) cuộn tới đây. Không bọc block trong thẻ
              nào nên bố cục các block giữ nguyên; scroll-mt bằng chiều cao header cố định (khớp padding của <main>). */}
          <span
            id={block.id}
            aria-hidden
            className="block scroll-mt-[72px] min-[880px]:scroll-mt-[88px]"
          />
          <Component data={block.data} lang={lang} />
        </Fragment>
      ))}
    </>
  );
}
