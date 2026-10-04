const CLOUDINARY_HOST = "res.cloudinary.com";
const VIDEO_MARKER = "/video/upload/";

export function isCloudinaryVideoUrl(src: string): boolean {
  try {
    const url = new URL(src);
    return url.hostname === CLOUDINARY_HOST && url.pathname.includes(VIDEO_MARKER);
  } catch {
    return false;
  }
}
