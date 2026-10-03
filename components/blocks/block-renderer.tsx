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
        <Component key={block.id} data={block.data} lang={lang} />
      ))}
    </>
  );
}
