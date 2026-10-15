import { SectionHead } from "./shared/section-head";
import { Reveal } from "./shared/reveal";
import { CardGridPanels, type CardGridItem } from "./card-grid-panels";
import { ProductShowcaseBlock } from "./product-showcase-block";
import { list, str } from "@/lib/blocks/read";
import type { BlockProps } from "./types";

// Quá số này thì panel nở quá hẹp: chuyển sang dải trượt ngang (cùng giao diện với block product-showcase).
const MAX_PANELS = 4;

export function CardGridBlock({ data, lang }: BlockProps) {
  const title = str(data.title);
  if (!title) return null;

  const items = list(data.items)
    .map((i) => ({ t: str(i.t), d: str(i.d), image: str(i.image) }))
    .filter((i): i is CardGridItem => Boolean(i.t));
  if (items.length === 0) return null;

  if (items.length > MAX_PANELS) return <ProductShowcaseBlock data={data} lang={lang} />;

  return (
    <section className="border-b border-border py-12 md:py-16">
      <div className="mx-auto max-w-[1240px] px-4">
        <Reveal>
          <SectionHead title={title} text={str(data.text)} />
        </Reveal>
        <Reveal>
          <CardGridPanels items={items} />
        </Reveal>
      </div>
    </section>
  );
}
