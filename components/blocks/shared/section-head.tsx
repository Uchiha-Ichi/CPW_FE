import { cn } from "@/lib/utils";
import { Eyebrow } from "./eyebrow";
import { RichTitle } from "./rich-title";

// `flush` bỏ khoảng cách phía dưới (dùng khi đặt cạnh nút điều khiển).
export function SectionHead({
  eyebrow,
  title,
  text,
  flush,
  className,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  flush?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", flush ? "" : "mb-12", className)}>
      {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
      <h2 className="text-3xl font-bold leading-[1.12] md:text-5xl">
        <RichTitle text={title} />
      </h2>
      {text && (
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{text}</p>
      )}
    </div>
  );
}
