import { RichTitle } from "./shared/rich-title";
import { Reveal } from "./shared/reveal";
import { BlockLink } from "./shared/block-link";
import { str } from "@/lib/blocks/read";
import type { BlockProps } from "./types";

export function CtaBlock({ data, lang }: BlockProps) {
  const title = str(data.title);
  if (!title) return null;

  const text = str(data.text);
  const label = str(data.buttonLabel);
  const href = str(data.buttonHref);

  return (
    <section className="bg-muted/20 px-4 py-24 text-center md:py-32">
      <Reveal className="mx-auto max-w-3xl">
        <h2 className="text-3xl font-bold leading-[1.12] md:text-5xl">
          <RichTitle text={title} />
        </h2>
        {text && (
          <p className="mx-auto mt-6 max-w-[50ch] text-lg leading-relaxed text-muted-foreground">
            {text}
          </p>
        )}
        {label && href && (
          <BlockLink
            href={href}
            lang={lang}
            className="mt-10 inline-block rounded-full bg-foreground px-10 py-5 text-lg font-semibold text-background shadow-lg transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            {label} <span aria-hidden>↗</span>
          </BlockLink>
        )}
      </Reveal>
    </section>
  );
}
