"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CloudinaryImage } from "@/components/blocks/shared/cloudinary-image";
import { ImagePlaceholder } from "@/components/shared/image-placeholder";
import { uploadPageImage, uploadPageVideo } from "@/lib/admin/page-editor/api";
import { errorMessages } from "@/lib/admin/post-errors";
import { isCloudinaryVideoUrl } from "@/lib/images/is-video-url";

interface ImageFieldProps {
  label: string;
  required?: boolean;
  value: string;
  disabled?: boolean;
  onChange: (url: string | undefined) => void;
  mediaVariant?: "loop" | "player";
}

export function ImageField({
  label,
  required,
  value,
  disabled,
  onChange,
  mediaVariant = "player",
}: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locked = disabled || uploading;

  async function pick(file: File) {
    setUploading(true);
    setError(null);
    try {
      const media = file.type.startsWith("video/")
        ? await uploadPageVideo(file, mediaVariant)
        : await uploadPageImage(file);
      onChange(media.url);
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
          const file = Array.from(e.dataTransfer.files).find(
            (f) => f.type.startsWith("image/") || f.type.startsWith("video/"),
          );
          if (file) void pick(file);
        }}
      >
        {isCloudinaryVideoUrl(value) ? (
          <video
            src={value}
            muted
            loop
            autoPlay
            playsInline
            className="h-16 w-24 rounded-md object-cover"
          />
        ) : value ? (
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
            {value ? "Đổi ảnh/video" : "Chọn ảnh/video"}
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
          <span>{uploading ? "Đang tải ảnh…" : "hoặc kéo thả ảnh/video vào đây"}</span>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
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
