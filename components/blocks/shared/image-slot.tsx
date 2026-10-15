import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { IMAGE_SPECS, type ImageSlotKey } from "@/lib/blocks/image-specs";

// Khung giữ chỗ khi chưa có ảnh/video: ghi rõ chỗ này cần ảnh gì, tỷ lệ nào, để người soạn biết đường chọn ảnh
// (thay cho ImagePlaceholder chỉ ghi "Ảnh: <nhãn>"). Quy cách lấy từ lib/blocks/image-specs.ts.
//   box:  khung nét đứt lấp đầy chỗ của ảnh (dense: bản chữ nhỏ cho khung bé).
//   chip: nhãn nhỏ đặt ở góc ô, dùng khi ô vẫn có nội dung khác (số thứ tự, tiêu đề). Màu theo currentColor
//         nên đặt được trên cả nền sáng lẫn nền tối.
export function ImageSlot({
  slot,
  label,
  variant = "box",
  dense,
  className,
}: {
  slot: ImageSlotKey;
  label?: string;
  variant?: "box" | "chip";
  dense?: boolean;
  className?: string;
}) {
  const spec = IMAGE_SPECS[slot];
  const head = `Ảnh ${spec.orientation} ${spec.ratio}`;

  if (variant === "chip") {
    return (
      <div
        title={`${head}, rộng từ ${spec.minWidth}px. ${spec.hint}`}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border border-dashed border-current/50 px-2.5 py-1.5 text-[0.7rem] font-semibold uppercase leading-none tracking-wider opacity-85",
          className,
        )}
      >
        <ImageIcon aria-hidden className="size-3.5 shrink-0" />
        {head}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-[200px] flex-col items-center justify-center border-2 border-dashed border-current/35 text-center text-muted-foreground max-[519px]:min-h-[120px]",
        dense ? "gap-1 p-3" : "gap-2 p-5",
        className,
      )}
    >
      <ImageIcon aria-hidden className={dense ? "size-5" : "size-6"} />
      <p className={cn("font-bold uppercase tracking-wider", dense ? "text-[0.65rem]" : "text-xs")}>{head}</p>
      {label && <p className={cn("font-medium", dense ? "text-xs" : "text-sm")}>{label}</p>}
      {/* Dòng hướng dẫn dài chỉ cần cho người soạn trên máy tính; trên điện thoại khung chỉ giữ biểu tượng, tỷ lệ và tên. */}
      <p className={cn("max-w-[18rem] leading-relaxed max-[519px]:hidden", dense ? "text-[0.7rem]" : "text-xs")}>
        {spec.hint} Rộng từ {spec.minWidth}px.
      </p>
    </div>
  );
}
