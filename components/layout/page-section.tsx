import { PageContainer } from "@/components/layout/page-container";
import { cn } from "@/lib/utils";

// Không tự bọc Reveal: nơi dùng tự bọc từng nhóm có chiều cao giới hạn.
export function PageSection({
  tone = "default",
  compact,
  id,
  children,
}: {
  tone?: "default" | "muted";
  // Đệm dọc nhỏ hơn (trang danh sách).
  compact?: boolean;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "border-b border-border",
        compact ? "py-8 md:py-10" : "py-12 md:py-16",
        tone === "muted" && "bg-muted/20",
      )}
    >
      <PageContainer>{children}</PageContainer>
    </section>
  );
}
