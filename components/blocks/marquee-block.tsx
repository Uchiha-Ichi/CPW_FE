import { list, str } from "@/lib/blocks/read";
import { repeatToMin } from "@/lib/blocks/marquee";
import type { BlockProps } from "./types";

export function MarqueeBlock({ data }: BlockProps) {
  const words = list(data.items)
    .map((i) => str(i.t))
    .filter((t): t is string => Boolean(t));
  if (words.length === 0) return null;

  const loop = repeatToMin(words, 8);
  const renderList = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden ? true : undefined}>
      {loop.map((word, i) => (
        <li
          key={i}
          className="flex items-center whitespace-nowrap px-6 font-display text-2xl font-medium md:text-4xl"
        >
          {word}
          <span aria-hidden className="ml-12 text-primary">
            ✦
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <section className="border-y border-border py-8">
      <div className="vcb-marquee">
        <div className="vcb-marquee-track">
          {renderList(false)}
          {renderList(true)}
        </div>
      </div>
    </section>
  );
}
