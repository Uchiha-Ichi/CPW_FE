import { SectionHead } from "./shared/section-head";
import { Reveal } from "./shared/reveal";
import { CloudinaryMedia } from "./shared/cloudinary-media";
import { ImagePlaceholder } from "@/components/shared/image-placeholder";
import { list, str } from "@/lib/blocks/read";
import { repeatToMin } from "@/lib/blocks/marquee";
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
          <ImagePlaceholder
            label={item.caption ?? ""}
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
  const featuredCaption = str(data.featuredCaption);
  const items: Item[] = list(data.items)
    .map((i) => ({ image: str(i.image), caption: str(i.caption) }))
    .filter((i) => i.image || i.caption);
  const loop = repeatToMin(items, 6);

  return (
    <section className="overflow-hidden border-b border-border py-20 md:py-28">
      <div className="mx-auto max-w-[1240px] px-4">
        <Reveal>
          <SectionHead eyebrow={str(data.eyebrow)} title={title} />
        </Reveal>
        {(featured || featuredCaption) && (
          <Reveal>
            <figure>
              <div className="relative aspect-[21/9] w-full overflow-hidden rounded-3xl border border-border bg-card">
                {featured ? (
                  <CloudinaryMedia
                    src={featured}
                    alt={featuredCaption ?? ""}
                    sizes="(min-width: 1240px) 1240px, 100vw"
                    variant="player"
                    className="object-cover"
                  />
                ) : (
                  <ImagePlaceholder
                    label={featuredCaption ?? ""}
                    className="h-full min-h-0! rounded-3xl border-0"
                  />
                )}
              </div>
              {featuredCaption && (
                <figcaption className="mt-3 text-sm text-muted-foreground">
                  {featuredCaption}
                </figcaption>
              )}
            </figure>
          </Reveal>
        )}
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
