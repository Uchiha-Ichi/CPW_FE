export function ImagePlaceholder({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`flex min-h-[200px] items-center justify-center border-2 border-dashed border-muted-foreground/40 text-center text-sm text-muted-foreground ${className ?? ""}`}
    >
      Ảnh: {label}
    </div>
  );
}
