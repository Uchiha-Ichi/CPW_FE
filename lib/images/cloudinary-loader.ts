const CLOUDINARY_HOST = "res.cloudinary.com";
const MARKER = "/image/upload/";

// Loader cho next/image: thêm f_auto,q_auto,w_<width> vào URL Cloudinary.
// Biến đổi của mình được đặt SAU các biến đổi có sẵn (trước phần version v123) để width cuối cùng thắng.
// URL không phải Cloudinary, không phải https, hoặc không phải URL thì trả nguyên.
export function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return src;
  }
  if (url.protocol !== "https:" || url.hostname !== CLOUDINARY_HOST) return src;

  const at = url.pathname.indexOf(MARKER);
  if (at === -1) return src;

  const head = url.pathname.slice(0, at + MARKER.length);
  const segments = url.pathname.slice(at + MARKER.length).split("/");
  const versionAt = segments.findIndex((segment) => /^v\d+$/.test(segment));
  segments.splice(versionAt === -1 ? 0 : versionAt, 0, `f_auto,q_${quality ?? "auto"},w_${width}`);
  url.pathname = head + segments.join("/");
  return url.toString();
}

const VIDEO_MARKER = "/video/upload/";

export function cloudinaryVideoUrl(src: string): string {
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return src;
  }
  if (url.protocol !== "https:" || url.hostname !== CLOUDINARY_HOST) return src;

  const at = url.pathname.indexOf(VIDEO_MARKER);
  if (at === -1) return src;

  const head = url.pathname.slice(0, at + VIDEO_MARKER.length);
  const segments = url.pathname.slice(at + VIDEO_MARKER.length).split("/");
  const versionAt = segments.findIndex((segment) => /^v\d+$/.test(segment));
  segments.splice(versionAt === -1 ? 0 : versionAt, 0, "f_auto,q_auto");
  url.pathname = head + segments.join("/");
  return url.toString();
}
