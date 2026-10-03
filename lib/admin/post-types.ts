export const POST_CATEGORIES = [
  "life-at-company",
  "news",
  "recruitment",
] as const;
export type PostCategory = (typeof POST_CATEGORIES)[number];

export const POST_CATEGORY_LABELS: Record<PostCategory, string> = {
  "life-at-company": "Đời sống công ty",
  news: "Tin tức",
  recruitment: "Tuyển dụng",
};

export type PostStatus = "draft" | "published";
export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  draft: "Bản nháp",
  published: "Đã đăng",
};

export type PostLang = "vi" | "en";

export const MAX_TITLE_LENGTH = 200;
export const MAX_EXCERPT_LENGTH = 200;

export interface PostCover {
  url: string;
  publicId: string;
}

export interface PostLocale {
  title?: string;
  excerpt?: string;
  content?: string;
}

export interface AdminPost {
  _id: string;
  slug: string;
  category: PostCategory;
  status: PostStatus;
  publishedAt?: string;
  cover?: PostCover;
  vi: PostLocale;
  en?: PostLocale;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminPostListResponse {
  items: AdminPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PostLocalePayload {
  title: string;
  excerpt: string;
  content: string;
}

export interface PostPayload {
  category: PostCategory;
  status?: PostStatus;
  vi: PostLocalePayload;
  en?: PostLocalePayload;
  cover?: { url: string };
}
