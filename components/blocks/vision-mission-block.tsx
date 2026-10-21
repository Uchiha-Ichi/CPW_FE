import { BlockHead } from "./shared/block-head";
import { Reveal } from "./shared/reveal";
import { list, str } from "@/lib/blocks/read";
import { BLOCK_SECTION, BLOCK_WRAP } from "@/lib/blocks/rhythm";
import { cn } from "@/lib/utils";
import type { BlockProps } from "./types";

// Một thẻ: thanh màu ở mép trên, tên thẻ, rồi nội dung. Thẻ nào rỗng thì không hiện.
function Card({
  accent,
  label,
  children,
}: {
  accent: "primary" | "cyan";
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <article className="relative h-full overflow-hidden rounded-[22px] border border-border bg-card p-8">
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 h-1 bg-gradient-to-r to-transparent",
          accent === "primary" ? "from-primary" : "from-[color:var(--tech-cyan)]",
        )}
      />
      {label && <h3 className="mb-3.5 text-[26px] font-bold uppercase tracking-[0.01em] leading-[1.2]">{label}</h3>}
      {children}
    </article>
  );
}

function Bullets({ items, accent }: { items: string[]; accent: "primary" | "cyan" }) {
  return (
    <ul className="m-0 grid gap-3 p-0 list-none">
      {items.map((text, i) => (
        <li
          key={i}
          className={cn(
            "relative pl-5 text-[15.5px] leading-relaxed text-muted-foreground",
            "before:absolute before:left-0 before:top-[0.6em] before:size-[7px] before:rounded-full",
            accent === "primary" ? "before:bg-primary" : "before:bg-[color:var(--tech-cyan)]",
          )}
        >
          {text}
        </li>
      ))}
    </ul>
  );
}

const readItems = (value: unknown): string[] =>
  list(value)
    .map((i) => str(i.t))
    .filter((t): t is string => Boolean(t));

export function VisionMissionBlock({ data }: BlockProps) {
  const title = str(data.title);
  if (!title) return null;

  const vision = str(data.vision);
  const goals = readItems(data.goals);
  const mission = readItems(data.mission);
  const hasVision = Boolean(vision) || goals.length > 0;
  const hasMission = mission.length > 0;

  if (!hasVision && !hasMission) return null;

  return (
    <section className={BLOCK_SECTION}>
      <div className={BLOCK_WRAP}>
        <Reveal>
          <BlockHead title={title} text={str(data.text)} />
        </Reveal>
        <div className="mt-7 grid grid-cols-1 gap-6 min-[861px]:grid-cols-2">
          {hasVision && (
            <Reveal className="h-full">
              <Card accent="primary" label={str(data.visionLabel)}>
                {vision && <p className="text-[17px] leading-relaxed text-muted-foreground">{vision}</p>}
                {goals.length > 0 && (
                  <>
                    {str(data.goalsLabel) && (
                      <div className="mt-[22px] mb-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-primary">
                        {str(data.goalsLabel)}
                      </div>
                    )}
                    <Bullets items={goals} accent="primary" />
                  </>
                )}
              </Card>
            </Reveal>
          )}
          {hasMission && (
            <Reveal delay={80} className="h-full">
              <Card accent="cyan" label={str(data.missionLabel)}>
                <Bullets items={mission} accent="cyan" />
              </Card>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
