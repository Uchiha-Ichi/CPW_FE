import { describe, expect, it } from "vitest";
import { partitionBlocks } from "./select";
import type { PublicBlock } from "./types";

const block = (id: string, type: string): PublicBlock => ({ id, type, data: {} });

describe("partitionBlocks", () => {
  const known = { hero: "HERO", cta: "CTA" } as Record<string, string | undefined>;

  it("giữ thứ tự và ghép đúng component", () => {
    const { items, unknownTypes } = partitionBlocks(
      [block("1", "cta"), block("2", "hero")],
      known,
    );
    expect(items.map((i) => [i.block.id, i.component])).toEqual([
      ["1", "CTA"],
      ["2", "HERO"],
    ]);
    expect(unknownTypes).toEqual([]);
  });

  it("bỏ type lạ và ghi lại một lần", () => {
    const { items, unknownTypes } = partitionBlocks(
      [block("1", "zzz"), block("2", "hero"), block("3", "zzz")],
      known,
    );
    expect(items).toHaveLength(1);
    expect(unknownTypes).toEqual(["zzz"]);
  });

  it("không tra nhầm thuộc tính của Object", () => {
    const { items, unknownTypes } = partitionBlocks(
      [block("1", "constructor"), block("2", "__proto__"), block("3", "toString")],
      known,
    );
    expect(items).toEqual([]);
    expect(unknownTypes).toEqual(["constructor", "__proto__", "toString"]);
  });

  it("mảng rỗng", () => {
    expect(partitionBlocks([], known)).toEqual({ items: [], unknownTypes: [] });
  });
});
