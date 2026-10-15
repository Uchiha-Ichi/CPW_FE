import { SectionHead } from "./shared/section-head";
import { Reveal } from "./shared/reveal";
import { CloudinaryMedia } from "./shared/cloudinary-media";
import { ImageSlot } from "./shared/image-slot";
import { list, str } from "@/lib/blocks/read";
import { repeatToMin } from "@/lib/blocks/marquee";
import { stripAccent } from "@/lib/blocks/accent";
import type { BlockProps } from "./types";

type Item = { image?: string; caption?: string };

function Tile({ item, hidden }: { item: Item; hidden: boolean }) {
  const alt = hidden ? "" : (item.caption ?? "");
  return (
    <li className="w-56 shrink-0 pr-4 sm:w-64">
      <div className="relative h-44 w-full overflow-hidden rounded-xl border border-border bg-card sm:h-48">
        {item.image ? (
          <CloudinaryMedia
            src={item.image}
            alt={alt}
            sizes="256px"
            variant="loop"
            className="object-cover"
          />
        ) : (
          <ImageSlot
            slot="photo-gallery.items.image"
            label={item.caption ?? ""}
            dense
            className="h-full min-h-0! border-0"
          />
        )}
      </div>
      {item.caption && (
        <p className="mt-2 text-sm text-muted-foreground">{item.caption}</p>
      )}
    </li>
  );
}

export function PhotoGalleryBlock({ data }: BlockProps) {
  const title = str(data.title);
  if (!title) return null;

  const featured = str(data.featured);
  const items: Item[] = list(data.items)
    .map((i) => ({ image: str(i.image), caption: str(i.caption) }))
    .filter((i) => i.image || i.caption);
  const loop = repeatToMin(items, 6);

  return (
    <section className="overflow-hidden border-b border-border py-12 md:py-16">
      <div className="mx-auto max-w-[1240px] px-4">
        <Reveal>
          <SectionHead title={title} />
        </Reveal>
        {/* Ảnh chính tỷ lệ 16:9 (cao hơn 21:9 cũ) trong đúng khung nội dung; cao tối đa 78% màn hình nên không bao giờ
            tràn màn hình thấp, và co theo bề ngang trên điện thoại. */}
        <Reveal>
          <div className="relative aspect-[16/9] max-h-[78vh] w-full overflow-hidden rounded-3xl border border-border bg-card">
            {featured ? (
              <CloudinaryMedia
                src={featured}
                alt={stripAccent(title)}
                sizes="(min-width: 1240px) 1240px, 100vw"
                variant="player"
                className="object-cover"
              />
            ) : (
              <ImageSlot slot="photo-gallery.featured" className="h-full min-h-0! rounded-3xl border-0" />
            )}
          </div>
        </Reveal>
      </div>

      {items.length > 0 && (
        <div className="vcb-marquee mt-10">
          <div
            className="vcb-marquee-track"
            style={{ "--vcb-marquee-duration": "40s" } as React.CSSProperties}
          >
            <ul className="flex shrink-0">
              {loop.map((item, i) => (
                <Tile key={i} item={item} hidden={false} />
              ))}
            </ul>
            <ul className="flex shrink-0" aria-hidden="true">
              {loop.map((item, i) => (
                <Tile key={i} item={item} hidden />
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
