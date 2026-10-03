// Kiểu dữ liệu của trình soạn block. Phản chiếu cpw_be/src/pages/blocks/field-kinds.ts,
// blocks/types.ts và AdminPageView trong site-pages.service.ts (viết tay, xem spec D12).

export type LocalizedKind = "text" | "textarea" | "title";

interface FieldBase {
  key: string;
  label: string;
  required?: boolean;
}

export interface LocalizedFieldDef extends FieldBase {
  kind: LocalizedKind;
  max: number;
}
export interface ImageFieldDef extends FieldBase {
  kind: "image";
}
export interface LinkFieldDef extends FieldBase {
  kind: "link";
}
export interface CountFieldDef extends FieldBase {
  kind: "count";
}
export interface EnumFieldDef extends FieldBase {
  kind: "enum";
  options: readonly string[];
}

export type ItemFieldDef =
  | LocalizedFieldDef
  | ImageFieldDef
  | LinkFieldDef
  | CountFieldDef
  | EnumFieldDef;

export interface ListFieldDef extends FieldBase {
  kind: "list";
  minItems: number;
  maxItems: number;
  of: readonly ItemFieldDef[];
}

export type FieldDef = ItemFieldDef | ListFieldDef;

export interface BlockDef {
  type: string;
  label: string;
  fields: readonly FieldDef[];
  together?: readonly (readonly string[])[];
}

export interface PageInfo {
  key: string;
  label: string;
}

// GET /pages/block-types
export interface BlockTypesResponse {
  blockTypes: BlockDef[];
  pages: PageInfo[];
  maxBlocksPerPage: number;
}

// Chữ trong block luôn là {vi, en?}.
export interface Localized {
  vi: string;
  en?: string;
}

export type BlockData = Record<string, unknown>;

export interface EditorBlock {
  id: string;
  type: string;
  data: BlockData;
}

export interface Snapshot {
  blocks: EditorBlock[];
}

// GET /pages/:pageKey và kết quả của PUT draft, POST publish, POST discard.
export interface AdminPageView {
  pageKey: string;
  version: number;
  pub: Snapshot | null;
  draft: Snapshot | null;
  working: Snapshot;
}

export interface UploadedImage {
  url: string;
  publicId: string;
}
