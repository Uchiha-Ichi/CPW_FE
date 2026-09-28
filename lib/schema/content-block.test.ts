import { describe, it, expect } from "vitest";
import { ContentBlockSchema } from "./content-block";

describe("ContentBlockSchema", () => {
  it("validates a complete valid block", () => {
    const validData = {
      layout: "hero",
      title: "Hero Title",
      text: "Hero description",
      image: "hero.png",
      imageAlt: "Hero Image",
      btnLabel: "Click Here",
      btnLink: "/home",
      items: [{ t: "Title", d: "Desc" }],
    };
    expect(ContentBlockSchema.safeParse(validData).success).toBe(true);
  });

  it("validates a minimal valid block", () => {
    const validData = {
      layout: "text",
      title: "Just Title",
    };
    expect(ContentBlockSchema.safeParse(validData).success).toBe(true);
  });

  it("rejects invalid layout", () => {
    const invalidData = {
      layout: "unknown",
      title: "Title",
    };
    expect(ContentBlockSchema.safeParse(invalidData).success).toBe(false);
  });

  it("rejects missing title", () => {
    const invalidData = {
      layout: "hero",
    };
    expect(ContentBlockSchema.safeParse(invalidData).success).toBe(false);
  });
});
