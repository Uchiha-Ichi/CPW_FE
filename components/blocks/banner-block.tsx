import { RichTitle } from "./shared/rich-title";
import { Reveal } from "./shared/reveal";
import { CloudinaryMedia } from "./shared/cloudinary-media";
import { str } from "@/lib/blocks/read";
import { stripAccent } from "@/lib/blocks/accent";
import { cn } from "@/lib/utils";
import type { BlockProps } from "./types";

export function BannerBlock({ data }: BlockProps) {
  const title = str(data.title);
  if (!title) return null;

  const text = str(data.text);
  const image = str(data.image);

  return (
    <section
      className={cn(
        "relative flex min-h-[360px] items-center justify-center overflow-hidden border-b border-border bg-muted px-4 py-16 text-center",
        image ? "text-white" : "text-foreground",
      )}
    >
      {image && (
        <>
          <CloudinaryMedia
            src={image}
            alt={stripAccent(title)}
            sizes="100vw"
            variant="loop"
            className="object-cover"
          />
          <div aria-hidden className="absolute inset-0 bg-black/55" />
        </>
      )}
      <Reveal className="relative z-10 max-w-3xl">
        <h2 className="text-3xl font-bold leading-[1.12] md:text-5xl">
          <RichTitle text={title} />
        </h2>
        {text && (
          <p
            className={cn(
              "mt-5 text-lg leading-relaxed",
              image ? "text-white/85" : "text-muted-foreground",
            )}
          >
            {text}
          </p>
        )}
      </Reveal>
    </section>
  );
}
