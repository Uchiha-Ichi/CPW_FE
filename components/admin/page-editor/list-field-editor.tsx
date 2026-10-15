"use client";

import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { FieldEditor, FieldGrid } from "@/components/admin/page-editor/field-editor";
import { AdminButton } from "@/components/admin/ui/admin-button";
import { blockSummary, moveItem, removeAt, setIn } from "@/lib/admin/page-editor/state";
import type { ListFieldDef } from "@/lib/admin/page-editor/types";
import { imageHintFor } from "@/lib/blocks/image-specs";

type ListItem = Record<string, unknown>;

interface ListFieldEditorProps {
  // Loại khối chứa danh sách này, để tra quy cách ảnh của các thẻ.
  blockType: string;
  def: ListFieldDef;
  items: ListItem[];
  idBase: string;
  disabled?: boolean;
  onChange: (items: ListItem[]) => void;
}

export function ListFieldEditor({ blockType, def, items, idBase, disabled, onChange }: ListFieldEditorProps) {
  const full = items.length >= def.maxItems;
  // Ảnh tách riêng thành một cột bên cạnh các ô chữ; thẻ không có ảnh thì chỉ có lưới ô chữ.
  const media = def.of.filter((field) => field.kind === "image");
  const rest = def.of.filter((field) => field.kind !== "image");

  function renderField(field: (typeof def.of)[number], item: ListItem, index: number) {
    return (
      <FieldEditor
        key={field.key}
        def={field}
        value={item[field.key]}
        idBase={`${idBase}-${index}`}
        disabled={disabled}
        mediaVariant="loop"
        imageHint={field.kind === "image" ? imageHintFor(blockType, def.key, field.key) : undefined}
        onChange={(value) => onChange(setIn(items, [index, field.key], value) as ListItem[])}
      />
    );
  }

  return (
    <fieldset className="col-span-full min-w-0 space-y-3">
      <legend className="mb-1 text-sm font-semibold">
        {def.label}
        <span className="ml-2 text-xs font-normal text-muted-foreground">
          {items.length}/{def.maxItems}
          {def.minItems > 0 ? ` (tối thiểu ${def.minItems})` : ""}
        </span>
      </legend>

      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">Chưa có mục nào.</p>
      )}

      {items.map((item, index) => {
        // Tóm tắt lấy từ chữ tiếng Việt của thẻ (ưu tiên ô bắt buộc, vì ô đầu tiên có thể chỉ là hậu tố "+"),
        // để nhận ra thẻ khi cuộn qua nhiều thẻ.
        const summary =
          blockSummary({ type: "", label: "", fields: def.of.filter((f) => f.required) }, item) ||
          blockSummary({ type: "", label: "", fields: def.of }, item);
        return (
          <div
            key={index}
            className="overflow-hidden rounded-lg border border-[color:var(--admin-line)] bg-muted/30"
          >
            <div className="flex items-center justify-between gap-2 border-b border-[color:var(--admin-line)] bg-card px-3 py-1.5">
              <span className="min-w-0 truncate text-sm font-semibold text-[color:var(--admin-brand-ink)]">
                {def.label} {index + 1}
                {summary && (
                  <span className="font-normal text-muted-foreground"> — {summary}</span>
                )}
              </span>
              <div className="flex shrink-0 items-center">
                <AdminButton
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Đưa ${def.label} ${index + 1} lên`}
                  disabled={disabled || index === 0}
                  onClick={() => onChange(moveItem(items, index, index - 1))}
                >
                  <ChevronUp />
                </AdminButton>
                <AdminButton
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Đưa ${def.label} ${index + 1} xuống`}
                  disabled={disabled || index === items.length - 1}
                  onClick={() => onChange(moveItem(items, index, index + 1))}
                >
                  <ChevronDown />
                </AdminButton>
                <AdminButton
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  danger
                  aria-label={`Xóa ${def.label} ${index + 1}`}
                  disabled={disabled}
                  onClick={() => onChange(removeAt(items, index))}
                >
                  <Trash2 />
                </AdminButton>
              </div>
            </div>

            <div className="@container p-3">
              {media.length > 0 && rest.length > 0 ? (
                <div className="grid gap-4 @2xl:grid-cols-[13rem_minmax(0,1fr)]">
                  <div className="space-y-4">{media.map((f) => renderField(f, item, index))}</div>
                  <FieldGrid>{rest.map((f) => renderField(f, item, index))}</FieldGrid>
                </div>
              ) : (
                <FieldGrid>{def.of.map((f) => renderField(f, item, index))}</FieldGrid>
              )}
            </div>
          </div>
        );
      })}

      <AdminButton
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || full}
        onClick={() => onChange([...items, {}])}
      >
        Thêm {def.label.toLowerCase()}
      </AdminButton>
      {full && (
        <p className="text-xs text-muted-foreground">Đã đủ {def.maxItems} mục, không thêm được nữa.</p>
      )}
    </fieldset>
  );
}
