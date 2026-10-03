"use client";

import { Button } from "@/components/ui/button";
import { ImagePlaceholder } from "@/components/shared/image-placeholder";

interface CoverFieldProps {
  previewUrl: string | null;
  disabled: boolean;
  onPick: (file: File) => void;
  onRemove: () => void;
}

export function CoverField({ previewUrl, disabled, onPick, onRemove }: CoverFieldProps) {
  return (
    <div>
      <label className="text-sm font-medium">Ảnh bìa</label>
      <div
        className="mt-1 flex cursor-pointer items-center gap-3 rounded-md border border-dashed p-3 transition-colors hover:bg-muted/50"
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/"));
          if (file) onPick(file);
        }}
        onClick={() => document.getElementById("cover-upload-input")?.click()}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="" className="h-16 w-24 rounded-md object-cover" />
        ) : (
          <ImagePlaceholder label="ảnh bìa" className="h-16 w-24 min-h-0 text-[10px]" />
        )}
        <div className="flex-1 space-y-1 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Bấm để chọn</span>, kéo thả hoặc
            dán ảnh (Ctrl+V) vào đây.
          </p>
        </div>
        <input
          id="cover-upload-input"
          type="file"
          accept="image/*"
          hidden
          disabled={disabled}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) onPick(file);
          }}
        />
      </div>
      {previewUrl && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2 text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          Bỏ ảnh
        </Button>
      )}
    </div>
  );
}
