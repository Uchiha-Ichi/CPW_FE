"use client";

import type { ReactNode } from "react";
import { ChevronDown, ChevronRight, ChevronUp, Trash2 } from "lucide-react";
import { FieldEditor, FieldGrid } from "@/components/admin/page-editor/field-editor";
import { ListFieldEditor } from "@/components/admin/page-editor/list-field-editor";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { blockSummary, type Path } from "@/lib/admin/page-editor/state";
import type { BlockDef, EditorBlock } from "@/lib/admin/page-editor/types";
import { imageHintFor } from "@/lib/blocks/image-specs";

interface BlockCardProps {
  block: EditorBlock;
  index: number;
  total: number;
  def: BlockDef | undefined;
  open: boolean;
  disabled?: boolean;
  handle: ReactNode; // tay kéo do block-list cung cấp
  onToggle: () => void;
  onMove: (delta: -1 | 1) => void;
  onRemove: () => void;
  onChange: (path: Path, value: unknown) => void;
}

export function BlockCard({
  block,
  index,
  total,
  def,
  open,
  disabled,
  handle,
  onToggle,
  onMove,
  onRemove,
  onChange,
}: BlockCardProps) {
  const label = def?.label ?? `Loại "${block.type}"`;
  const summary = blockSummary(def, block.data);
  const bodyId = `block-body-${block.id}`;

  return (
    <div className="rounded-xl border border-[color:var(--admin-line)] bg-card text-card-foreground">
      <div className="flex items-center gap-2 p-2">
        {handle}
        <button
          type="button"
          className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1 text-left transition-colors hover:bg-[color:var(--admin-brand-soft)] motion-reduce:transition-none"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={onToggle}
        >
          {open ? <ChevronDown className="size-4 shrink-0" /> : <ChevronRight className="size-4 shrink-0" />}
          <span className="shrink-0 text-xs text-muted-foreground">{index + 1}.</span>
          <span className="min-w-0 truncate text-sm font-medium">{label}</span>
          {summary && (
            <span className="truncate text-sm text-muted-foreground max-[760px]:hidden">— {summary}</span>
          )}
        </button>
        <div className="flex shrink-0 items-center gap-1">
          <AdminButton
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Đưa khối ${index + 1} lên`}
            disabled={disabled || index === 0}
            onClick={() => onMove(-1)}
          >
            <ChevronUp />
          </AdminButton>
          <AdminButton
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Đưa khối ${index + 1} xuống`}
            disabled={disabled || index === total - 1}
            onClick={() => onMove(1)}
          >
            <ChevronDown />
          </AdminButton>
          <AdminButton
            type="button"
            variant="ghost"
            size="icon-sm"
            danger
            aria-label={`Xóa khối ${index + 1}`}
            disabled={disabled}
            onClick={onRemove}
          >
            <Trash2 />
          </AdminButton>
        </div>
      </div>

      {open && (
        <div id={bodyId} className="border-t border-[color:var(--admin-line)] p-4">
          {def ? (
            <FieldGrid>
              {def.fields.map((field) =>
                field.kind === "list" ? (
                  <ListFieldEditor
                    key={field.key}
                    blockType={block.type}
                    def={field}
                    items={asItems(block.data[field.key])}
                    idBase={`${block.id}-${field.key}`}
                    disabled={disabled}
                    onChange={(items) => onChange([field.key], items)}
                  />
                ) : (
                  <FieldEditor
                    key={field.key}
                    def={field}
                    value={block.data[field.key]}
                    idBase={block.id}
                    disabled={disabled}
                    mediaVariant={block.type === "banner" ? "loop" : "player"}
                    imageHint={field.kind === "image" ? imageHintFor(block.type, null, field.key) : undefined}
                    onChange={(value) => onChange([field.key], value)}
                  />
                ),
              )}
              {def.together?.map((group) => (
                <p key={group.join("+")} className="col-span-full text-xs text-muted-foreground">
                  Cần nhập cùng lúc: {group.map((key) => labelOf(def, key)).join(" và ")}.
                </p>
              ))}
            </FieldGrid>
          ) : (
            <p className="text-sm text-[color:var(--admin-danger)]">
              Loại khối &quot;{block.type}&quot; không còn trong hệ thống. Hãy xóa khối này.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function asItems(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value)
    ? value.map((item) =>
        typeof item === "object" && item !== null && !Array.isArray(item)
          ? (item as Record<string, unknown>)
          : {},
      )
    : [];
}

function labelOf(def: BlockDef, key: string): string {
  return def.fields.find((f) => f.key === key)?.label ?? key;
}
