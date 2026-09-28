import { ContentBlock } from "@/components/content-block/content-block";
import { Marquee } from "@/components/marquee/marquee";
import { ABOUT_BLOCKS, ABOUT_GALLERY } from "@/data/about";

export default function AboutPage() {
  const [hero, ...rest] = ABOUT_BLOCKS;

  return (
    <>
      <ContentBlock data={hero} />
      <section className="py-8">
        <Marquee items={ABOUT_GALLERY} />
      </section>
      {rest.map((block, i) => (
        <ContentBlock key={i} data={block} />
      ))}
    </>
  );
}
