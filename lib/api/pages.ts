import type { paths } from "./schema";
import { fetchPublicList } from "./client";

type PublicPageBlocksResponse =
  paths["/api/pages/public/{pageKey}"]["get"]["responses"][200]["content"]["application/json"];
export type PublicPageBlock = PublicPageBlocksResponse[number];

export type PageKey = "home" | "about" | "careers" | "contact" | "news";

export function getPublicPageBlocks(
  pageKey: PageKey
): Promise<PublicPageBlock[]> {
  return fetchPublicList<PublicPageBlock>(`/pages/public/${pageKey}`);
}
