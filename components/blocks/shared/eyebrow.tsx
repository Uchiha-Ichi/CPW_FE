import { cn } from "@/lib/utils";

export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 text-[0.8rem] font-semibold uppercase tracking-widest text-muted-foreground",
        className,
      )}
    >
      <span
        aria-hidden
        className="h-2 w-2 rounded-full bg-primary/60 shadow-[0_0_0_5px_rgba(23,125,242,0.1)]"
      />
      {children}
    </div>
  );
}
