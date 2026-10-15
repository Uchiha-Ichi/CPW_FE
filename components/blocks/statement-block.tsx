import { RichTitle } from "./shared/rich-title";
import { Reveal } from "./shared/reveal";
import { list, str } from "@/lib/blocks/read";
import type { BlockProps } from "./types";

export function StatementBlock({ data }: BlockProps) {
  const title = str(data.title);
  if (!title) return null;

  const meta = list(data.meta)
    .map((m) => str(m.t))
    .filter((t): t is string => Boolean(t));

  return (
    // Dải luôn tối, không đổi theo giao diện sáng/tối: nền xanh đậm pha từ token --tech-* (hằng số ở :root),
    // không dùng token --background vì nó đảo màu khi đổi giao diện.
    <section className="border-b border-primary-foreground/10 bg-[color-mix(in_srgb,var(--tech-blue)_35%,var(--tech-ink))] py-16 text-primary-foreground md:py-24">
      <div className="mx-auto max-w-[1240px] px-4">
        <Reveal>
          {/* Chữ nhấn mặc định là text-primary (xanh #177DF2) chỉ đạt 2,88:1 trên nền xanh đậm: đổi sang cyan (6,9:1). */}
          <h2 className="max-w-4xl text-3xl font-bold leading-[1.12] md:text-5xl lg:text-6xl [&_em]:text-[color:var(--tech-cyan)]">
            <RichTitle text={title} />
          </h2>
          {meta.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-x-10 gap-y-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-primary-foreground/70">
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
