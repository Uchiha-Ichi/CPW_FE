import { RichTitle } from "./shared/rich-title";
import { Reveal } from "./shared/reveal";
import { list, str } from "@/lib/blocks/read";
import type { BlockProps } from "./types";

export function StatementBlock({ data }: BlockProps) {
  const title = str(data.title);
  if (!title) return null;

  const kicker = str(data.kicker);
  const meta = list(data.meta)
    .map((m) => str(m.t))
    .filter((t): t is string => Boolean(t));

  return (
    <section className="border-b border-[#111D2F] bg-[#050A14] py-24 text-[#EEF6FF] md:py-32">
      <div className="mx-auto max-w-[1240px] px-4">
        <Reveal>
          {kicker && (
            <div className="mb-6 flex items-center gap-3 text-[0.8rem] font-semibold uppercase tracking-widest text-[#55a6ff]">
              <span
                aria-hidden
                className="h-2 w-2 rounded-full bg-[#2f8cff] shadow-[0_0_0_5px_rgba(47,140,255,0.1)]"
              />
              {kicker}
            </div>
          )}
          <h2 className="max-w-4xl text-3xl font-bold leading-[1.12] md:text-5xl lg:text-6xl">
            <RichTitle text={title} />
          </h2>
          {meta.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-x-10 gap-y-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#75859c]">
              {meta.map((m, i) => (
                <span key={i}>{m}</span>
              ))}
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
