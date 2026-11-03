import { BlockHead } from "./shared/block-head";
import { TimelineTrack, type TimelineItem } from "./timeline-track";
import { list, str } from "@/lib/blocks/read";
import { BLOCK_SECTION, BLOCK_WRAP } from "@/lib/blocks/rhythm";
import type { BlockProps } from "./types";

export function TimelineBlock({ data }: BlockProps) {
  const title = str(data.title);
  if (!title) return null;

  const rawItems = list(data.items);
  const items: TimelineItem[] = [];
  for (const raw of rawItems) {
    const t = str(raw.t);
    if (!t) continue;
    const d = str(raw.d);
    items.push({ t, ...(d ? { d } : {}) });
  }

  if (items.length < 2) return null;

  return (
    <section className={BLOCK_SECTION}>
      <div className={BLOCK_WRAP}>
        <BlockHead title={title} titleClassName="max-w-[16em]" />
        <TimelineTrack items={items} />
      </div>
    </section>
  );
}

