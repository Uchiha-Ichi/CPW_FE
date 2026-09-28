import type { paths } from "./schema";
import { fetchPublicList } from "./client";

export type PublicProduct = {
  name: string;
  category: string;
  description?: string;
};

export function getPublicProducts(): Promise<PublicProduct[]> {
  return fetchPublicList<PublicProduct>("/products/public");
}
