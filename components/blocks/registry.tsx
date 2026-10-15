import type { ComponentType } from "react";
import type { BlockProps } from "./types";
import { HeroBlock } from "./hero-block";
import { TextImageBlock } from "./text-image-block";
import { BannerBlock } from "./banner-block";
import { CtaBlock } from "./cta-block";
import { StatementBlock } from "./statement-block";
import { CardGridBlock } from "./card-grid-block";
import { StatsBlock } from "./stats-block";
import { CarouselBlock } from "./carousel-block";
import { MarqueeBlock } from "./marquee-block";
import { PhotoGalleryBlock } from "./photo-gallery-block";
import { NetworkBlock } from "./network/network-block";
import { FeaturedNewsBlock } from "./featured-news/featured-news-block";

// Bảng ánh xạ type của block (đúng tên trong cpw_be/src/pages/blocks/registry.ts) sang component.
// Thêm loại block mới = thêm một dòng ở đây và một component.
export const BLOCK_COMPONENTS: Record<string, ComponentType<BlockProps> | undefined> = {
  hero: HeroBlock,
  "text-image": TextImageBlock,
  banner: BannerBlock,
  cta: CtaBlock,
  statement: StatementBlock,
  "card-grid": CardGridBlock,
  stats: StatsBlock,
  carousel: CarouselBlock,
  marquee: MarqueeBlock,
  "photo-gallery": PhotoGalleryBlock,
  network: NetworkBlock,
  "featured-news": FeaturedNewsBlock,
};
