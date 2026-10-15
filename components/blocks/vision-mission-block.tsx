import { Sparkles, Target } from "lucide-react";
import { SectionHead } from "./shared/section-head";
import { Reveal } from "./shared/reveal";
import { list, str } from "@/lib/blocks/read";
import { cn } from "@/lib/utils";
import type { BlockProps } from "./types";

// Một thẻ: thanh màu ở mép trên, ô biểu tượng, tên thẻ, rồi nội dung. Thẻ nào rỗng thì không hiện.
function Card({
  accent,
  icon,
  label,
  children,
}: {
  accent: "primary" | "cyan";
  icon: React.ReactNode;
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <article className="relative h-full overflow-hidden rounded-3xl border border-border bg-card p-6 md:p-8">
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r to-transparent",
          accent === "primary" ? "from-primary" : "from-[color:var(--tech-cyan)]",
        )}
      />
      <span
        aria-hidden
        className={cn(
          "grid size-12 place-items-center rounded-2xl text-primary",
          accent === "primary" ? "bg-primary/10" : "bg-[color:var(--tech-cyan)]/20",
        )}
      >
        {icon}
      </span>
      {label && <h3 className="mt-6 text-3xl font-bold uppercase leading-[1.15]">{label}</h3>}
      {children}
    </article>
  );
}

function Bullets({ items, accent }: { items: string[]; accent: "primary" | "cyan" }) {
  return (
    <ul className="mt-4 space-y-3">
      {items.map((text, i) => (
        <li key={i} className="flex gap-3 leading-relaxed text-muted-foreground">
          <span
            aria-hidden
            className={cn(
              "mt-2.5 size-2 shrink-0 rounded-full",
              accent === "primary" ? "bg-primary" : "bg-[color:var(--tech-cyan)]",
            )}
          />
          <span>{text}</span>
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

  return (
    <section className="border-b border-border py-12 md:py-16">
      <div className="mx-auto max-w-[1240px] px-4">
        <Reveal>
          <SectionHead title={title} text={str(data.text)} />
        </Reveal>
        {(hasVision || hasMission) && (
          <div className="grid gap-6 md:grid-cols-2">
            {hasVision && (
              <Reveal className="h-full">
                <Card accent="primary" icon={<Target className="size-6" />} label={str(data.visionLabel)}>
                  {vision && <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{vision}</p>}
                  {goals.length > 0 && (
                    <>
                      {str(data.goalsLabel) && (
                        <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-primary">
                          {str(data.goalsLabel)}
                        </p>
                      )}
                      <Bullets items={goals} accent="primary" />
                    </>
                  )}
                </Card>
              </Reveal>
            )}
            {hasMission && (
              <Reveal delay={80} className="h-full">
                <Card accent="cyan" icon={<Sparkles className="size-6" />} label={str(data.missionLabel)}>
                  <Bullets items={mission} accent="cyan" />
                </Card>
              </Reveal>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
