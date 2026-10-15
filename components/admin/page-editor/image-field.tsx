"use client";

import { useRef, useState } from "react";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { CloudinaryImage } from "@/components/blocks/shared/cloudinary-image";
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
  // Quy cách ảnh của chỗ này (tỷ lệ, cỡ, nên chọn ảnh gì); lấy từ lib/blocks/image-specs.ts.
  hint?: string;
}

export function ImageField({
  label,
  required,
  value,
  disabled,
  onChange,
  mediaVariant = "player",
  hint,
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
    <div className="@container min-w-0">
      <span className="text-sm font-medium">
        {label}
        {required && <span className="text-[color:var(--admin-danger)]"> *</span>}
      </span>
      {hint && <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{hint}</p>}
      {/* Hẹp (cột bên cạnh một thẻ): ảnh nằm trên, nút nằm dưới. Từ 20rem: ảnh nhỏ bên trái, nút bên phải. */}
      <div
        className="mt-1.5 flex flex-col gap-3 rounded-lg border border-dashed border-[color:var(--admin-field-border)] bg-card p-3 transition-colors hover:bg-[color:var(--admin-brand-soft)] motion-reduce:transition-none @[20rem]:flex-row @[20rem]:items-center"
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
            className="h-24 w-full rounded-md object-cover @[20rem]:h-16 @[20rem]:w-24"
          />
        ) : value ? (
          <CloudinaryImage
            src={value}
            alt=""
            width={240}
            height={160}
            className="h-24 w-full rounded-md object-cover @[20rem]:h-16 @[20rem]:w-24"
          />
        ) : (
          <div className="flex h-24 w-full items-center justify-center rounded-md bg-muted px-1 text-center text-xs text-muted-foreground @[20rem]:h-16 @[20rem]:w-24">
            Chưa có {label.toLowerCase()}
          </div>
        )}
        <div className="flex flex-1 flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <AdminButton
            type="button"
            variant="outline"
            size="sm"
            disabled={locked}
            onClick={() => inputRef.current?.click()}
          >
            {value ? "Đổi ảnh/video" : "Chọn ảnh/video"}
          </AdminButton>
          {value && (
            <AdminButton
              type="button"
              variant="ghost"
              size="sm"
              danger
              disabled={locked}
              onClick={() => onChange(undefined)}
            >
              Bỏ ảnh/video
            </AdminButton>
          )}
          <span>{uploading ? "Đang tải ảnh/video…" : "hoặc kéo thả ảnh/video vào đây"}</span>
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
      {error && <p className="mt-1 text-sm text-[color:var(--admin-danger)]">{error}</p>}
    </div>
  );
}
