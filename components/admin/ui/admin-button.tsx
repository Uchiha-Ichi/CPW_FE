import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ButtonProps = React.ComponentProps<typeof Button>;
type Variant = NonNullable<ButtonProps["variant"]>;
type Size = NonNullable<ButtonProps["size"]>;

// Bọc ui/button (dùng chung với site) để admin có nút 40px (44px trên điện thoại) và màu đạt AA,
// mà không sửa ui/button. cn() gộp lớp xung đột nên lớp ở đây thắng lớp gốc cùng nhóm.
const VARIANT: Record<Variant, string> = {
  default:
    "bg-[color:var(--admin-brand-strong)] hover:bg-[color:var(--admin-brand-ink)]",
  outline:
    "border-[color:var(--admin-field-border)] bg-card hover:border-[color:var(--admin-brand-strong)] hover:bg-card hover:text-[color:var(--admin-brand-ink)]",
  secondary:
    "bg-[color:var(--admin-brand-soft)] text-[color:var(--admin-brand-ink)] hover:bg-[color:var(--admin-brand-soft)] hover:brightness-95",
  ghost:
    "hover:bg-[color:var(--admin-brand-soft)] hover:text-[color:var(--admin-brand-ink)]",
  destructive:
    "bg-[color:var(--admin-danger-soft)] text-[color:var(--admin-danger)] hover:bg-[color:var(--admin-danger-soft)] hover:brightness-95",
  link: "text-[color:var(--admin-brand-ink)]",
};

const SIZE: Record<Size, string> = {
  default: "h-10 px-4 max-[760px]:h-11",
  xs: "h-8 px-2.5 max-[760px]:h-10",
  sm: "h-9 px-3 max-[760px]:h-11",
  lg: "h-11 px-5",
  icon: "size-10 max-[760px]:size-11",
  "icon-xs": "size-8 max-[760px]:size-10",
  "icon-sm": "size-9 max-[760px]:size-11",
  "icon-lg": "size-11",
};

const FOCUS =
  "focus-visible:border-[color:var(--admin-brand-strong)] focus-visible:ring-2 focus-visible:ring-[color:var(--admin-brand-strong)]";

const DANGER =
  "text-[color:var(--admin-danger)] hover:bg-[color:var(--admin-danger-soft)] hover:text-[color:var(--admin-danger)]";

export function AdminButton({
  className,
  variant,
  size,
  danger = false,
  ...props
}: ButtonProps & {
  /** Chữ đỏ cho hành động xóa (dùng với variant ghost hoặc outline). */
  danger?: boolean;
}) {
  // cva cho phép null; Button cũng coi null như mặc định.
  const v: Variant = variant ?? "default";
  const s: Size = size ?? "default";
  return (
    <Button
      variant={v}
      size={s}
      className={cn(
        "rounded-lg transition-colors motion-reduce:transition-none",
        VARIANT[v],
        SIZE[s],
        FOCUS,
        danger && DANGER,
        className,
      )}
      {...props}
    />
  );
}
