import { BLOCK_H2, BLOCK_LEAD } from "@/lib/blocks/rhythm";
import { cn } from "@/lib/utils";
import { RichTitle } from "./rich-title";

// Tiêu đề + câu dẫn của khối mới (nhịp theo lib/blocks/rhythm.ts). Khối nào cần giới hạn bề rộng tiêu đề
// (card-grid, timeline, project-strip, network) truyền `titleClassName`.
export function BlockHead({
  title,
  text,
  titleClassName,
  className,
}: {
  title: string;
  text?: string;
  titleClassName?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 className={cn(BLOCK_H2, titleClassName)}>
        <RichTitle text={title} />
      </h2>
      {text && <p className={BLOCK_LEAD}>{text}</p>}
    </div>
  );
}
