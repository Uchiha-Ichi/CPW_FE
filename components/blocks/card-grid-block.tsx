import { SectionHead } from "./shared/section-head";
import { Reveal } from "./shared/reveal";
import { CloudinaryMedia } from "./shared/cloudinary-media";
import { list, str } from "@/lib/blocks/read";
import type { BlockProps } from "./types";

export function CardGridBlock({ data }: BlockProps) {
  const title = str(data.title);
  if (!title) return null;

  const items = list(data.items)
    .map((i) => ({ t: str(i.t), d: str(i.d), image: str(i.image) }))
    .filter((i) => i.t);
  if (items.length === 0) return null;

  return (
    <section className="border-b border-border py-20 md:py-28">
      <div className="mx-auto max-w-[1240px] px-4">
        <Reveal>
          <SectionHead eyebrow={str(data.eyebrow)} title={title} text={str(data.text)} />
        </Reveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <Reveal key={i} delay={i * 80} className="h-full">
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40">
                {item.image && (
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <CloudinaryMedia
                      src={item.image}
                      alt={item.t ?? ""}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      variant="loop"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-8">
                  <div className="mb-8 text-xs font-semibold tracking-widest text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="text-2xl font-bold">{item.t}</h3>
                  {item.d && (
                    <p className="mt-4 leading-relaxed text-muted-foreground">{item.d}</p>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
