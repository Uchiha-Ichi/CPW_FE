import { PageContainer } from "@/components/layout/page-container";
import { cn } from "@/lib/utils";

// Không tự bọc Reveal: nơi dùng tự bọc từng nhóm có chiều cao giới hạn.
export function PageSection({
  tone = "default",
  id,
  children,
}: {
  tone?: "default" | "muted";
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn("border-b border-border py-12 md:py-16", tone === "muted" && "bg-muted/20")}
    >
      <PageContainer>{children}</PageContainer>
    </section>
  );
}
