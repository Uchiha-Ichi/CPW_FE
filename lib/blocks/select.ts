import type { PublicBlock } from "./types";

// Ghép block với component theo type. Dùng hasOwnProperty để type như "constructor" không tra nhầm
// thuộc tính của Object.prototype.
export function partitionBlocks<T>(
  blocks: PublicBlock[],
  known: Record<string, T | undefined>,
): { items: { block: PublicBlock; component: T }[]; unknownTypes: string[] } {
  const items: { block: PublicBlock; component: T }[] = [];
  const unknownTypes: string[] = [];
  for (const block of blocks) {
    const component = Object.prototype.hasOwnProperty.call(known, block.type)
      ? known[block.type]
      : undefined;
    if (component === undefined) {
      if (!unknownTypes.includes(block.type)) unknownTypes.push(block.type);
      continue;
    }
    items.push({ block, component });
  }
  return { items, unknownTypes };
}
