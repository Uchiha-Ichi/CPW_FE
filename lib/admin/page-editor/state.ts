import type { AdminPageView, BlockData, BlockDef, EditorBlock } from "./types";

// ---------- Trạng thái trình soạn (reducer thuần, xem spec D3) ----------

export type PathKey = string | number;
export type Path = readonly PathKey[];

export interface EditorState {
  pageKey: string;
  version: number;
  blocks: EditorBlock[]; // bản đang soạn
  savedBlocks: EditorBlock[]; // bản server trả về lần gần nhất
  hasDraft: boolean;
  hasPub: boolean;
}

export type EditorAction =
  | { type: "load"; view: AdminPageView }
  | { type: "reset" }
  | { type: "add"; block: EditorBlock }
  | { type: "remove"; id: string }
  | { type: "move"; from: number; to: number }
  | { type: "setValue"; id: string; path: Path; value: unknown };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function fromView(view: AdminPageView): EditorState {
  return {
    pageKey: view.pageKey,
    version: view.version,
    blocks: clone(view.working.blocks),
    savedBlocks: clone(view.working.blocks),
    hasDraft: view.draft !== null,
    hasPub: view.pub !== null,
  };
}

// Block mới có id uuid ngay ở FE (spec D4); backend nhận id hợp lệ và giữ nguyên.
export function createBlock(type: string, id: string = crypto.randomUUID()): EditorBlock {
  return { id, type, data: {} };
}

export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  const out = [...list];
  if (from < 0 || from >= out.length || to < 0 || to >= out.length || from === to) return out;
  const [item] = out.splice(from, 1);
  out.splice(to, 0, item);
  return out;
}

export function removeAt<T>(list: readonly T[], index: number): T[] {
  return list.filter((_, i) => i !== index);
}

// Ghi bất biến. value === undefined thì xóa khóa (chỉ áp dụng cho khóa chữ, không áp cho chỉ số mảng).
export function setIn(root: unknown, path: Path, value: unknown): unknown {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  if (typeof head === "number") {
    const arr = Array.isArray(root) ? [...root] : [];
    arr[head] = setIn(arr[head], rest, value);
    return arr;
  }
  const obj: Record<string, unknown> = isRecord(root) ? { ...root } : {};
  const next = setIn(obj[head], rest, value);
  if (next === undefined) delete obj[head];
  else obj[head] = next;
  return obj;
}

export function editorReducer(state: EditorState | null, action: EditorAction): EditorState | null {
  if (action.type === "load") return fromView(action.view);
  if (action.type === "reset") return null;
  if (state === null) return state;
  switch (action.type) {
    case "add":
      return { ...state, blocks: [...state.blocks, action.block] };
    case "remove":
      return { ...state, blocks: state.blocks.filter((b) => b.id !== action.id) };
    case "move":
      return { ...state, blocks: moveItem(state.blocks, action.from, action.to) };
    case "setValue":
      return {
        ...state,
        blocks: state.blocks.map((block) =>
          block.id === action.id
            ? { ...block, data: (setIn(block.data, action.path, action.value) ?? {}) as BlockData }
            : block,
        ),
      };
    default:
      return state;
  }
}

// ---------- Dọn dữ liệu trước khi gửi (spec D5) ----------

function pruneValue(value: unknown): unknown {
  if (typeof value === "string") return value === "" ? undefined : value;
  if (typeof value === "number") return Number.isNaN(value) ? undefined : value;
  if (Array.isArray(value)) {
    if (value.length === 0) return undefined;
    // Giữ mục list rỗng ({}) để server báo "mục trống" kèm số thứ tự.
    return value.map((item) => (isRecord(item) ? (pruneRecord(item) ?? {}) : item));
  }
  if (isRecord(value)) return pruneRecord(value);
  return value === null ? undefined : value;
}

function pruneRecord(record: Record<string, unknown>): Record<string, unknown> | undefined {
  const out: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(record)) {
    const value = pruneValue(raw);
    if (value !== undefined) out[key] = value;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

export function cleanBlocks(blocks: readonly EditorBlock[]): EditorBlock[] {
  return blocks.map((block) => ({
    id: block.id,
    type: block.type,
    data: pruneRecord(block.data) ?? {},
  }));
}

// So sánh không phụ thuộc thứ tự khóa (server trả khóa theo registry, form có thể thêm khóa theo thứ tự khác).
function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (isRecord(value)) {
    const keys = Object.keys(value).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

export function isDirty(state: EditorState): boolean {
  return (
    stableStringify(cleanBlocks(state.blocks)) !== stableStringify(cleanBlocks(state.savedBlocks))
  );
}

export type PageStatus = "dirty" | "draft" | "published" | "empty";

export function pageStatus(state: EditorState): PageStatus {
  if (isDirty(state)) return "dirty";
  if (state.hasDraft) return "draft";
  if (state.hasPub) return "published";
  return "empty";
}

export const STATUS_LABELS: Record<PageStatus, string> = {
  dirty: "Có thay đổi chưa lưu",
  draft: "Có bản nháp chưa đăng",
  published: "Đã đăng",
  empty: "Chưa có nội dung",
};

// ---------- Hỗ trợ hiển thị ----------

// Bộ đếm theo code point, giống server (Array.from(value).length).
export function countChars(value: string): number {
  return Array.from(value).length;
}

export function readText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function readLocalized(value: unknown): { vi: string; en: string } {
  if (!isRecord(value)) return { vi: "", en: "" };
  return { vi: readText(value.vi), en: readText(value.en) };
}

export function readCount(value: unknown): string {
  return typeof value === "number" && Number.isFinite(value) ? String(value) : "";
}

// Dòng tóm tắt trên tiêu đề thẻ block: bản tiếng Việt đầu tiên tìm được theo thứ tự field của registry.
export function blockSummary(def: BlockDef | undefined, data: BlockData, max = 60): string {
  if (!def) return "";
  for (const field of def.fields) {
    if (field.kind !== "text" && field.kind !== "textarea" && field.kind !== "title") continue;
    const { vi } = readLocalized(data[field.key]);
    const text = vi.replaceAll("*", "").replace(/\s+/g, " ").trim();
    if (text === "") continue;
    const chars = Array.from(text);
    return chars.length > max ? `${chars.slice(0, max).join("")}…` : text;
  }
  return "";
}
