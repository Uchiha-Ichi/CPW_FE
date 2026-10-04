"use client";

import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { FieldEditor } from "@/components/admin/page-editor/field-editor";
import { Button } from "@/components/ui/button";
import { moveItem, removeAt, setIn } from "@/lib/admin/page-editor/state";
import type { ListFieldDef } from "@/lib/admin/page-editor/types";

type ListItem = Record<string, unknown>;

interface ListFieldEditorProps {
  def: ListFieldDef;
  items: ListItem[];
  idBase: string;
  disabled?: boolean;
  onChange: (items: ListItem[]) => void;
}

export function ListFieldEditor({ def, items, idBase, disabled, onChange }: ListFieldEditorProps) {
  const full = items.length >= def.maxItems;

  return (
    <fieldset className="space-y-2 rounded-md border p-3">
      <legend className="px-1 text-sm font-medium">
        {def.label}
        <span className="ml-2 text-xs font-normal text-muted-foreground">
          {items.length}/{def.maxItems}
          {def.minItems > 0 ? ` (tối thiểu ${def.minItems})` : ""}
        </span>
      </legend>

      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">Chưa có mục nào.</p>
      )}

      {items.map((item, index) => (
        <div key={index} className="space-y-3 rounded-md bg-muted/30 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {def.label} {index + 1}
            </span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={`Đưa ${def.label} ${index + 1} lên`}
                disabled={disabled || index === 0}
                onClick={() => onChange(moveItem(items, index, index - 1))}
              >
                <ChevronUp />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={`Đưa ${def.label} ${index + 1} xuống`}
                disabled={disabled || index === items.length - 1}
                onClick={() => onChange(moveItem(items, index, index + 1))}
              >
                <ChevronDown />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="text-destructive"
                aria-label={`Xóa ${def.label} ${index + 1}`}
                disabled={disabled}
                onClick={() => onChange(removeAt(items, index))}
              >
                <Trash2 />
              </Button>
            </div>
          </div>
          {def.of.map((field) => (
            <FieldEditor
              key={field.key}
              def={field}
              value={item[field.key]}
              idBase={`${idBase}-${index}`}
              disabled={disabled}
              mediaVariant="loop"
              onChange={(value) => onChange(setIn(items, [index, field.key], value) as ListItem[])}
            />
          ))}
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || full}
        onClick={() => onChange([...items, {}])}
      >
        Thêm {def.label.toLowerCase()}
      </Button>
      {full && (
        <p className="text-xs text-muted-foreground">Đã đủ {def.maxItems} mục, không thêm được nữa.</p>
      )}
    </fieldset>
  );
}
