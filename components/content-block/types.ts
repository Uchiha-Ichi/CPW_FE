export type ContentBlockLayout =
  | "hero"
  | "text"
  | "imgleft"
  | "imgright"
  | "banner"
  | "cards"
  | "cta";

export interface ContentBlockItem {
  t: string;
  d: string;
}

export interface ContentBlockData {
  layout: ContentBlockLayout;
  title: string;
  text?: string;
  image?: string;
  imageAlt?: string;
  btnLabel?: string;
  btnLink?: string;
  items?: ContentBlockItem[];
}
