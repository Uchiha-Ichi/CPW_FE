"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CloudinaryImage } from "@/components/blocks/shared/cloudinary-image";
import { ImagePlaceholder } from "@/components/shared/image-placeholder";
import { uploadPageImage } from "@/lib/admin/page-editor/api";
import { errorMessages } from "@/lib/admin/post-errors";

interface ImageFieldProps {
  label: string;
  required?: boolean;
  value: string;
  disabled?: boolean;
  onChange: (url: string | undefined) => void;
}

export function ImageField({ label, required, value, disabled, onChange }: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locked = disabled || uploading;

  async function pick(file: File) {
    setUploading(true);
    setError(null);
    try {
      const image = await uploadPageImage(file);
      onChange(image.url);
    } catch (err) {
      setError(errorMessages(err).join(" "));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <span className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </span>
      <div
        className="mt-1 flex items-center gap-3 rounded-md border border-dashed p-3 transition-colors hover:bg-muted/50"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (locked) return;
          const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/"));
          if (file) void pick(file);
        }}
      >
        {value ? (
          <CloudinaryImage
            src={value}
            alt=""
            width={96}
            height={64}
            className="h-16 w-24 rounded-md object-cover"
          />
        ) : (
          <ImagePlaceholder label={label} className="h-16 w-24 min-h-0 text-[10px]" />
        )}
        <div className="flex flex-1 flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={locked}
            onClick={() => inputRef.current?.click()}
          >
            {value ? "Đổi ảnh" : "Chọn ảnh"}
          </Button>
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive"
              disabled={locked}
              onClick={() => onChange(undefined)}
            >
              Bỏ ảnh
            </Button>
          )}
          <span>{uploading ? "Đang tải ảnh…" : "hoặc kéo thả ảnh vào đây"}</span>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          disabled={locked}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void pick(file);
          }}
        />
      </div>
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}
