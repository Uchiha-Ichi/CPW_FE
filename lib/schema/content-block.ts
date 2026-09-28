import { z } from "zod";

export const ContentBlockLayoutSchema = z.enum([
  "hero",
  "text",
  "imgleft",
  "imgright",
  "banner",
  "cards",
  "cta",
]);

export const ContentBlockItemSchema = z.object({
  t: z.string(),
  d: z.string(),
});

export const ContentBlockSchema = z.object({
  layout: ContentBlockLayoutSchema,
  title: z.string(),
  text: z.string().optional(),
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  btnLabel: z.string().optional(),
  btnLink: z.string().optional(),
  items: z.array(ContentBlockItemSchema).optional(),
});
