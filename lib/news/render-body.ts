export type NewsBodyBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; lines: string[] }
  | { type: "list"; items: string[] }
  | { type: "quote"; lines: string[] };

export function renderNewsBody(raw: string | undefined): NewsBodyBlock[] {
  const text = (raw ?? "").replace(/\r/g, "").trim();
  if (!text) return [];

  const blocks: NewsBodyBlock[] = [];
  let para: string[] = [];
  let list: string[] = [];
  let quote: string[] = [];

  function flush() {
    if (para.length) {
      blocks.push({ type: "paragraph", lines: para });
      para = [];
    }
    if (list.length) {
      blocks.push({ type: "list", items: list });
      list = [];
    }
    if (quote.length) {
      blocks.push({ type: "quote", lines: quote });
      quote = [];
    }
  }

  for (const line of text.split("\n")) {
    if (!line.trim()) {
      flush();
      continue;
    }
    if (line.startsWith("## ")) {
      flush();
      blocks.push({ type: "heading", text: line.slice(3) });
      continue;
    }
    if (line.startsWith("- ")) {
      if (para.length || quote.length) flush();
      list.push(line.slice(2));
      continue;
    }
    if (line.startsWith("> ")) {
      if (para.length || list.length) flush();
      quote.push(line.slice(2));
      continue;
    }
    if (list.length || quote.length) flush();
    para.push(line);
  }
  flush();
  return blocks;
}
