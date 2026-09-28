import type { paths } from "./schema";
import { fetchPublicList } from "./client";

export type PublicPhotoSlot = {
  name: string;
  page: string;
  slot?: string;
  image?: string;
};

export function getPublicPhotoSlots(
  page?: "Trang chủ" | "Về chúng tôi"
): Promise<PublicPhotoSlot[]> {
  const qs = page ? `?page=${encodeURIComponent(page)}` : "";
  return fetchPublicList<PublicPhotoSlot>(`/photos/public${qs}`);
}
