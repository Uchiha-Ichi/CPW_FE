import { ContentBlock } from "@/components/content-block/content-block";
import { Marquee } from "@/components/marquee/marquee";
import { getPublicPageBlocks } from "@/lib/api/pages";
import { getPublicPhotoSlots } from "@/lib/api/photos";
import type { ContentBlockData } from "@/components/content-block/types";
import type { MarqueeItem } from "@/components/marquee/marquee";

export default async function AboutPage() {
  const [blocks, photos] = await Promise.all([
    getPublicPageBlocks("about"),
    getPublicPhotoSlots("Về chúng tôi"),
  ]);

  const contentBlocks: ContentBlockData[] = blocks.map((b) => ({
    layout: b.layout as any,
    title: b.title,
    text: b.text,
    image: b.image,
    imageAlt: b.title,
    btnLabel: b.btnLabel,
    btnLink: b.btnLink,
    items: b.items as any,
  }));

  const gallery: MarqueeItem[] = photos.map((p) => ({
    src: p.image || undefined,
    alt: p.name,
  }));

  const hero = contentBlocks.find((b) => b.layout === "hero");
  const rest = contentBlocks.filter((b) => b.layout !== "hero");

  return (
    <>
      {hero && <ContentBlock data={hero} />}
      {gallery.length > 0 && (
        <section className="py-8">
          <Marquee items={gallery} />
        </section>
      )}
      {rest.map((block, i) => (
        <ContentBlock key={i} data={block} />
      ))}
    </>
  );
}
