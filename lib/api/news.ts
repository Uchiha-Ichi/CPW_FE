import type { paths } from "./schema";
import { fetchPublicList } from "./client";

export type PublicNewsArticle = {
  title: string;
  category: string;
  date: string;
  status: string;
  summary?: string;
  body?: string;
  cover?: string;
};

export function getPublicNewsArticles(): Promise<PublicNewsArticle[]> {
  return fetchPublicList<PublicNewsArticle>("/news/public");
}
