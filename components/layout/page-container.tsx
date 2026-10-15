import { cn } from "@/lib/utils";

// Đường lề trái dùng chung cho vỏ trang (PageHero, PageSection, PageCta, PageSkeleton).
// Các block tự khai báo container riêng cùng giá trị.
export function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("mx-auto w-full max-w-[1240px] px-4", className)}>{children}</div>;
}
