"use client";

import Image, { type ImageProps } from "next/image";
import { cloudinaryLoader } from "@/lib/images/cloudinary-loader";

// next/image với loader Cloudinary dùng chung. Phải là client component vì loader là hàm
// (không truyền được từ server component xuống).
export function CloudinaryImage({ alt, ...props }: Omit<ImageProps, "loader">) {
  return <Image alt={alt} {...props} loader={cloudinaryLoader} />;
}
