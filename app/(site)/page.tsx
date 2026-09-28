import { ContentBlock } from "@/components/content-block/content-block";
import type { ContentBlockData } from "@/components/content-block/types";
import { getPublicPageBlocks } from "@/lib/api/pages";
import { NetworkSection } from "@/components/home/network-section";
import { ProductsSection } from "@/components/home/products-section";

export default async function HomePage() {
  const blocks = await getPublicPageBlocks("home");

  const contentBlocks: ContentBlockData[] = blocks.map((b) => ({
    layout: b.layout,
    title: b.title,
    text: b.text,
    image: b.image,
    imageAlt: b.title,
    btnLabel: b.btnLabel,
    btnLink: b.btnLink,
    items: b.items,
  }));

  const hero = contentBlocks.find((b) => b.layout === "hero");
  const rest = contentBlocks.filter((b) => b.layout !== "hero");

  return (
    <>
      {hero && <ContentBlock data={hero} />}
      <NetworkSection />
      <ProductsSection />
      {rest.map((block, i) => (
        <ContentBlock key={i} data={block} />
      ))}
    </>
  );
}
